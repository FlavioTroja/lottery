import * as cheerio from 'cheerio';
import * as lotto from '../../services/lotto.service';
import { LottoDetail } from '../../lib/postgres';

export default async function handler(req: any, res: any) {    
    let myHeaders = new Headers();
    myHeaders.append("User-Agent", "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/114.0");
    myHeaders.append("Accept", "*/*");
    myHeaders.append("Accept-Language", "it");
    myHeaders.append("Accept-Encoding", "gzip, deflate, br");
    myHeaders.append("X-Requested-With", "XMLHttpRequest");
    myHeaders.append("Content-Type", "text/plain;charset=UTF-8");
    myHeaders.append("Content-Length", "0");
    myHeaders.append("Connection", "keep-alive");
    myHeaders.append("Sec-Fetch-Dest", "empty");
    myHeaders.append("Sec-Fetch-Mode", "cors");
    myHeaders.append("Sec-Fetch-Site", "same-origin");
    myHeaders.append("Sec-GPC", "1");
    myHeaders.append("Pragma", "no-cache");
    myHeaders.append("Cache-Control", "no-cache");

    const requestOptions = {
        method: 'POST',
        headers: myHeaders
    };
    
    let [ extQuery, yearQuery ] = [req.query.ext ?? 0, req.query.year ?? new Date().getFullYear()];

    if (!req.query.ext && !req.query.year) {
      const last = await lotto.findLast();

      if (last) {
        [ extQuery, yearQuery ] = last?.code?.split("/");
      }

      extQuery = !!extQuery ? +extQuery + 1 : 1;
      yearQuery = yearQuery || new Date().getFullYear();
    }

    const found = await lotto.findByCode(`${extQuery}/${yearQuery}`);
    if (found) {
      return res.status(201).json('Estrazione già presente');
    }

    const response = await fetch(`${process.env.LOTTO_URL}&_it_sogei_wda_web_portlet_WebDisplayAamsPortlet_anno=${(yearQuery)}&_it_sogei_wda_web_portlet_WebDisplayAamsPortlet_prog=${extQuery}`, requestOptions);
    // The return value is *not* serialized
    // You can return Date, Map, Set, etc.
   
    // Recommendation: handle errors
    if (!response.ok) {
      // This will activate the closest `error.js` Error Boundary
      throw new Error('Failed to fetch data');
    }
   
    const page = await response.text();
    const $ = cheerio.load(page);

    if ($('div.error').text() === 'Non ci sono estrazioni') {
      return res.status(404).json('Non ci sono estrazioni');
    }

    const label: string = JSON.parse($('div#cmsTiTrovi').text().replaceAll("'","\""))?.breadcrumb[0]?.label ?? '';

    const stringDate = label.match(/\d{2}\/\d{2}\/\d{4}/g) ?? '';
    const [ day, month, year ] = stringDate?.toString().split('/');
    const date = new Date(+year, +month - 1, +day);

    const saved = await lotto.create({
        code: `${extQuery}/${yearQuery}`,
        date,
        label
    });

    const exts: LottoDetail[] = $('table.tabella_d tr').map((i, x) => {
      const [ ext1, ext2, ext3, ext4, ext5 ] = $(x).children(`td[headers='R${i}']`).map((ee, ff) => Number.parseInt($(ff).text())).toArray();
      return {
        code: `R${i}`,
        city: $(x).children(`th#R${i}`).text(),
        ext1,
        ext2,
        ext3,
        ext4,
        ext5, 
        parent_id: Number(saved.insertId)
      } as LottoDetail;
    }).toArray();

    for (let i = 0; i < exts.length; i++) {
      await lotto.createDetail(exts[i]);
    }

    // update occurrence
    await lotto.syncOccurenceByLottoId(Number(saved.insertId)); 

    return res.status(200).json(label);
}