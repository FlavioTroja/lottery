import * as cheerio from 'cheerio';
import * as extraction from '../../services/extraction.service.tsx';
import * as extractionDetail from '../../services/extractionDetail.service.tsx';


export default async function handler(req, res) {    

    let myHeaders = new Headers();
    myHeaders.append("User-Agent", "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/114.0");
    myHeaders.append("Accept", "*/*");
    myHeaders.append("Accept-Language", "it");
    myHeaders.append("Accept-Encoding", "gzip, deflate, br");
    myHeaders.append("X-Requested-With", "XMLHttpRequest");
    myHeaders.append("Content-Type", "text/plain;charset=UTF-8");
    myHeaders.append("Content-Length", "0");
    myHeaders.append("Origin", "https://www.adm.gov.it");
    myHeaders.append("Connection", "keep-alive");
    myHeaders.append("Referer", "https://www.adm.gov.it/portale/monopoli/giochi/gioco-del-lotto/lotto_g/lotto_estr?prog=76&anno=2023");
    myHeaders.append("Sec-Fetch-Dest", "empty");
    myHeaders.append("Sec-Fetch-Mode", "cors");
    myHeaders.append("Sec-Fetch-Site", "same-origin");
    myHeaders.append("Sec-GPC", "1");
    myHeaders.append("Pragma", "no-cache");
    myHeaders.append("Cache-Control", "no-cache");
    myHeaders.append("Cookie", "JSESSIONID=4AoevmiqKR1iaePlzMid3t18Iuxa_EK3GV1ArieN.node8; GUEST_LANGUAGE_ID=it_IT; COOKIE_SUPPORT=true");

    const requestOptions = {
        method: 'POST',
        headers: myHeaders
    };
    
    let [ extQuery, yearQuery ] = [0, 2023];

    const last = await extraction.findLast();

    if (last) {
      [ extQuery, yearQuery ] = last?.code?.split("/");
    }

    extQuery = !!extQuery ? +extQuery + 1 : 1;
    yearQuery = yearQuery || 2023;

    const response = await fetch(`${process.env.LOTTERY_URL}&_it_sogei_wda_web_portlet_WebDisplayAamsPortlet_anno=${(yearQuery)}&_it_sogei_wda_web_portlet_WebDisplayAamsPortlet_prog=${extQuery}`, requestOptions);
    // The return value is *not* serialized
    // You can return Date, Map, Set, etc.
   
    // Recommendation: handle errors
    if (!response.ok) {
      // This will activate the closest `error.js` Error Boundary
      throw new Error('Failed to fetch data');
    }
   
    const page = await response.text();
    
    const $ = cheerio.load(page);
    const label = JSON.parse($('div#cmsTiTrovi').text())?.breadcrumb[0]?.label ?? '';

    const found = await extraction.findByCode(`${extQuery}/${yearQuery}`);
    if(!found) {
      console.log(`${label.match(/\d+\/\d+\/\d+/g) ?? ''} - Element ${extQuery}/${yearQuery} not found.`);

      const stringDate = label.match(/\d{2}\/\d{2}\/\d{4}/g) ?? '';
      const [ day, month, year ] = stringDate?.toString().split('/');
      const date = new Date(+year, +month - 1, +day);

      const saved = await extraction.create({
         code: `${extQuery}/${yearQuery}`,
         date,
         label
      });

      const exts = $('table.tabella_d tr').map((i, x) => {
        const [ ext1, ext2, ext3, ext4, ext5 ] = $(x).children(`td[headers='R${i}']`).map((ee, ff) => $(ff).text()).toArray();
        return {
          code: `R${i}`,
          city: $(x).children(`th#R${i}`).text(),
          ext1,
          ext2,
          ext3,
          ext4,
          ext5, 
          extraction_id: saved.insertId
        };
      }).toArray();

      for (let i = 0; i < exts.length; i++) {
        await extractionDetail.create(exts[i]);
      }
    }

    return res.status(200).json(label);
}