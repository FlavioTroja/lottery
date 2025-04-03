import * as cheerio from 'cheerio';
import { LottoDetail } from '../../lib/postgres';
import * as lotto from '../../services/lotto.service';

export default async function handler(req: any, res: any) {
  // Impostazione degli header, invariata
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

  // Recupero parametri da query (o ultimo in DB +1)
  let [ extQuery, yearQuery ] = [
    req.query.ext ?? 0,
    req.query.year ?? new Date().getFullYear()
  ];

  if (!req.query.ext && !req.query.year) {
    const last = await lotto.findLast();
    if (last) {
      [ extQuery, yearQuery ] = last?.code?.split("/");
    }
    extQuery = extQuery ? +extQuery + 1 : 1;
    yearQuery = yearQuery || new Date().getFullYear();
  }

  // Verifichiamo se questa estrazione è già presente
  const found = await lotto.findByCode(`${extQuery}/${yearQuery}`);
  if (found) {
    return res.status(201).json('Estrazione già presente');
  }

  // Effettuiamo la fetch
  const response = await fetch(
    `${process.env.LOTTO_URL}&_it_sogei_wda_web_portlet_WebDisplayAamsPortlet_anno=${yearQuery}&_it_sogei_wda_web_portlet_WebDisplayAamsPortlet_prog=${extQuery}`,
    requestOptions
  );
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }

  // Carichiamo la pagina HTML con cheerio
  const page = await response.text();
  const $ = cheerio.load(page);

  // Se la pagina segnala esplicitamente "Non ci sono estrazioni"
  if ($('div.error').text().includes('Non ci sono estrazioni')) {
    return res.status(404).json('Non ci sono estrazioni');
  }

  // Ricaviamo la label e la data (come prima)
  const labelJSON = $('div#cmsTiTrovi').text().replaceAll("'", "\"");
  const label: string = JSON.parse(labelJSON)?.breadcrumb?.[0]?.label ?? '';
  const stringDate = label.match(/\d{2}\/\d{2}\/\d{4}/g) ?? '';
  const [ day, month, year ] = stringDate.toString().split('/');
  const date = new Date(+year, +month - 1, +day);

  // Creiamo il record principale dell’estrazione
  const saved = await lotto.create({
    code: `${extQuery}/${yearQuery}`,
    date,
    label
  });

  const exts: LottoDetail[] = [];
  $('div.list-group-item.mt-1.mb-1.pt-3.pb-3.border-0').each((i, el) => {
    const city = $(el).find('div.col-md-3 h3').first().text().trim().toUpperCase();
    
    // Se è la riga di intestazione, la saltiamo
    if (city === 'RUOTA') return;
  
    // Recupero i 5 numeri
    const numbers = $(el)
      .find('div.col-md-7 .col-md-2 span')
      .map((_, span) => parseInt($(span).text().trim(), 10))
      .toArray();
  
    // Se non ci sono 5 numeri validi, saltiamo
    if (numbers.length !== 5 || numbers.some(n => isNaN(n))) return;
  
    console.log("DATI:",{
      code: `R${i}`,  
      city,           
      ext1: numbers[0],
      ext2: numbers[1],
      ext3: numbers[2],
      ext4: numbers[3],
      ext5: numbers[4],
      parent_id: Number(saved?.id)
    });

    exts.push({
      code: `R${i}`,  
      city,           
      ext1: numbers[0],
      ext2: numbers[1],
      ext3: numbers[2],
      ext4: numbers[3],
      ext5: numbers[4],
      parent_id: Number(saved?.id)
    });
  });
  

  // Salvataggio dei dettagli in DB
  for (let i = 0; i < exts.length; i++) {
    await lotto.createDetail(exts[i]);
  }

  // Aggiorna le occorrenze
  await lotto.syncOccurenceByLottoId(Number(saved?.id));

  return res.status(200).json(label);
}
