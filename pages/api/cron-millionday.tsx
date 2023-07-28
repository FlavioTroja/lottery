import * as cheerio from 'cheerio';
import * as millionday from '../../services/millionday.service';
import * as milliondaydetail from '../../services/milliondaydetail.service';
import { MillionDay, MillionDayDetail } from '../../lib/planetscale';

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
      const last = await millionday.findLast();

      if (last) {
        [ extQuery, yearQuery ] = last?.code?.split("/");
      }

      extQuery = !!extQuery ? +extQuery + 1 : 1;
      yearQuery = yearQuery || new Date().getFullYear();
    }

    const found = await millionday.findByCode(`${extQuery}/${yearQuery}`);
    if (found) {
      return res.status(201).json('Estrazione già presente');
    }

    const response = await fetch(`${process.env.MILLIONDAY_URL}&_it_sogei_wda_web_portlet_WebDisplayAamsPortlet_anno=${(yearQuery)}&_it_sogei_wda_web_portlet_WebDisplayAamsPortlet_prog=${extQuery}`, requestOptions);
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

    const saved = await millionday.create({
        code: `${extQuery}/${yearQuery}`,
        date,
        label
    } as MillionDay);

    const arr = $('div.estrazioni').children('p').map((i,p) => Number.parseInt($(p).text().trim())).toArray();
    console.log(arr.slice(0, 5));
    console.log(arr.slice(5, 10));
    let [ ext1, ext2, ext3, ext4, ext5 ] = arr.slice(0, 5);

    let exts = [
      {
        type: "PRIMARY",
        ext1,
        ext2,
        ext3,
        ext4,
        ext5, 
        parent_id: Number(saved.insertId)
      } as MillionDayDetail];

      if(arr.slice(5, 10).length > 0) {
        [ ext1, ext2, ext3, ext4, ext5 ] = arr.slice(5, 10);
        exts = [ ...exts, {
          type: "EXTRA",
          ext1,
          ext2,
          ext3,
          ext4,
          ext5, 
          parent_id: Number(saved.insertId)
        } as MillionDayDetail ];
      }

    for (let i = 0; i < exts.length; i++) {
      await milliondaydetail.create(exts[i]);
    }

    return res.status(200).json(label);
}