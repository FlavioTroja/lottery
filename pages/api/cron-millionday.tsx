import * as cheerio from 'cheerio';
import { MillionDay, MillionDayDetail } from '../../lib/postgres';
import * as millionday from '../../services/millionday.service';

export default async function handler(req: any, res: any) {    
  // Imposta gli header aggiornati come nella nuova chiamata cURL
  let myHeaders = new Headers();
  myHeaders.append("User-Agent", "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0");
  myHeaders.append("Accept", "*/*");
  myHeaders.append("Accept-Language", "it-IT,it;q=0.8,en-US;q=0.5,en;q=0.3");
  myHeaders.append("Accept-Encoding", "gzip, deflate, br, zstd");
  myHeaders.append("X-Requested-With", "XMLHttpRequest");
  myHeaders.append("Content-Type", "text/plain;charset=UTF-8");
  myHeaders.append("Content-Length", "0");
  myHeaders.append("Origin", "https://www.adm.gov.it");
  myHeaders.append("DNT", "1");
  myHeaders.append("Connection", "keep-alive");
  myHeaders.append("Referer", "https://www.adm.gov.it/portale/millionday");
  myHeaders.append("Cookie", "JSESSIONID=ZpNR4JbPZdsosfrM0WP9sGGBe_gnkDixk2LqgGxV.node7; COOKIE_SUPPORT=true; GUEST_LANGUAGE_ID=it_IT; _pk_id.6.088c=ce58283d00bc4afd.1743673026.; _pk_ses.6.088c=1; LFR_SESSION_STATE_20159=1743673168675; adm_cookie_bar_new=1");
  myHeaders.append("Sec-Fetch-Dest", "empty");
  myHeaders.append("Sec-Fetch-Mode", "cors");
  myHeaders.append("Sec-Fetch-Site", "same-origin");
  myHeaders.append("Sec-GPC", "1");
  myHeaders.append("TE", "trailers");

  const requestOptions = {
    method: 'POST',
    headers: myHeaders
  };

  // Recupera i parametri della query oppure calcola il progressivo in base all'ultimo inserito
  let [ extQuery, yearQuery ] = [req.query.ext ?? 0, req.query.year ?? new Date().getFullYear()];

  if (!req.query.ext && !req.query.year) {
    const last = await millionday.findLast();
    if (last) {
      [ extQuery, yearQuery ] = last?.code?.split("/");
    }
    extQuery = !!extQuery ? +extQuery + 1 : 1;
    yearQuery = yearQuery || new Date().getFullYear();
  }

  // Se l'estrazione esiste già, interrompi
  const found = await millionday.findByCode(`${extQuery}/${yearQuery}`);
  if (found) {
    return res.status(201).json('Estrazione già presente');
  }
  
  // Esegui la fetch combinando l'URL con i parametri anno e progressivo
  const response = await fetch(`${process.env.MILLIONDAY_URL}&_it_sogei_wda_web_portlet_WebDisplayAamsPortlet_anno=${yearQuery}&_it_sogei_wda_web_portlet_WebDisplayAamsPortlet_prog=${extQuery}`, requestOptions);
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }

  const page = await response.text();
  const $ = cheerio.load(page);

  // Controlla se la pagina indica "Non ci sono estrazioni"
  if ($("div[data-tag='ueMD26']").text().includes("Non ci sono estrazioni")) {
    return res.status(404).json('Non ci sono estrazioni');
  }

  // Estrai il JSON dal blocco 'div#cmsTiTrovi' e ricava la label contenente la data
  const label: string = JSON.parse($('div#cmsTiTrovi').text().replaceAll("'", "\""))?.breadcrumb[0]?.label ?? '';
  const stringDate = label.match(/\d{2}\/\d{2}\/\d{4}/g) ?? '';
  const [ day, month, year ] = stringDate.toString().split('/');
  const date = new Date(+year, +month - 1, +day);

  // Crea il record principale dell'estrazione MillionDay
  const saved = await millionday.create({
    code: `${extQuery}/${yearQuery}`,
    date,
    label
  } as MillionDay);

  // Estrai i numeri dall'elemento 'div.estrazioni' (supponendo che i numeri siano in elementi <p>)
  const arr = $('div.estrazioni').children('p')
    .map((i, p) => Number.parseInt($(p).text().trim()))
    .toArray();

  console.log("Numeri primary:", arr.slice(0, 5));
  console.log("Numeri extra:", arr.slice(5, 10));

  let [ ext1, ext2, ext3, ext4, ext5 ] = arr.slice(0, 5);
  let exts: MillionDayDetail[] = [{
    type: "PRIMARY",
    ext1,
    ext2,
    ext3,
    ext4,
    ext5, 
    parent_id: Number(saved?.id)
  }];

  // Se esiste un gruppo extra (ad esempio estrazioni bonus), aggiungilo
  if (arr.slice(5, 10).length > 0) {
    [ ext1, ext2, ext3, ext4, ext5 ] = arr.slice(5, 10);
    exts.push({
      type: "EXTRA",
      ext1,
      ext2,
      ext3,
      ext4,
      ext5, 
      parent_id: Number(saved?.id)
    });
  }

  // Salva i dettagli delle estrazioni
  for (let i = 0; i < exts.length; i++) {
    await millionday.createDetail(exts[i]);
  }

  return res.status(200).json(label);
}
