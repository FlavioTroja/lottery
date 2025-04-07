import * as cheerio from 'cheerio';
import * as lotto10 from '../../services/lotto10.service';

export default async function handler(req: any, res: any) {
  // Imposta gli header come per cron_lotto.tsx
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

  const requestOptions = { method: 'POST', headers: myHeaders };

  // Recupera i parametri di query o usa il progressivo successivo a quello più recente
  let [ extQuery, yearQuery ] = [ req.query.ext ?? 0, req.query.year ?? new Date().getFullYear() ];
  if (!req.query.ext && !req.query.year) {
    const last = await lotto10.findLast();
    if (last) { [ extQuery, yearQuery ] = last?.code?.split("/"); }
    extQuery = extQuery ? +extQuery + 1 : 1;
    yearQuery = yearQuery || new Date().getFullYear();
  }
  
  // Se l'estrazione esiste già, interrompi
  const found = await lotto10.findByCode(`${extQuery}/${yearQuery}`);
  if (found) {
    return res.status(201).json('Estrazione già presente');
  }

  // Effettua la fetch usando l'URL per il 10eLotto
  const response = await fetch(
    `${process.env.LOTTO10_URL}&_it_sogei_wda_web_portlet_WebDisplayAamsPortlet_anno=${yearQuery}&_it_sogei_wda_web_portlet_WebDisplayAamsPortlet_prog=${extQuery}`,
    requestOptions
  );
  if (!response.ok) { throw new Error('Failed to fetch data'); }

  const page = await response.text();
  const $ = cheerio.load(page);

  // Controlla se la pagina indica l'assenza di estrazioni
  if ($('div.error').text().includes('Non ci sono estrazioni')) {
    return res.status(404).json('Non ci sono estrazioni');
  }

  // Estrai il titolo dal primo blocco "div.estrazioni" (che contiene l'h3)
  const headerText = $('div.estrazioni').first().find('h3').text().trim();
  // Esempio: "Estrazione 10eLotto n° 92 del 27/07/2023"
  const label = headerText; // Puoi modificare se vuoi estrarre solo parte del testo

  // Estrai la data dal titolo utilizzando una regex (formato dd/mm/yyyy)
  const dateMatch = headerText.match(/\d{2}\/\d{2}\/\d{4}/);
  let date: Date;
  if (dateMatch) {
    const [ day, month, year ] = dateMatch[0].split('/');
    date = new Date(+year, +month - 1, +day);
  } else {
    date = new Date();
  }

  // Crea il record principale per l'estrazione 10eLotto
  const saved = await lotto10.create({
    code: `${extQuery}/${yearQuery}`,
    date,
    label
  });

  // --- Parsing dei numeri ---

  // 1. Estrai il blocco PRIMARY dalla prima "div.estrazioni"
  let primaryNumbers: number[] = [];
  // Il primo "div.estrazioni" contiene il <h3> e poi una serie di <p>
  $('div.estrazioni').first().children('p').each((i, el) => {
    const num = Number.parseInt($(el).text().trim(), 10);
    if (!isNaN(num)) {
      primaryNumbers.push(num);
    }
  });

  // 2. Estrai Numero Oro, Doppio Oro ed Extra (se presenti)
  let numeroOro: number[] = [];
  let doppioOro: number[] = [];
  let extraNumbers: number[] = [];
  
  $('h4').each((i, el) => {
    const header = $(el).text().trim();
    if (header.includes("Numero Oro")) {
      $(el).next('div.estrazioni').children('p').each((j, p) => {
        const n = Number.parseInt($(p).text().trim(), 10);
        if (!isNaN(n)) numeroOro.push(n);
      });
    } else if (header.includes("Doppio Oro")) {
      $(el).next('div.estrazioni').children('p').each((j, p) => {
        const n = Number.parseInt($(p).text().trim(), 10);
        if (!isNaN(n)) doppioOro.push(n);
      });
    } else if (header.includes("Extra")) {
      $(el).next('div.estrazioni').children('p').each((j, p) => {
        const n = Number.parseInt($(p).text().trim(), 10);
        if (!isNaN(n)) extraNumbers.push(n);
      });
    }
  });

  console.log("Primary numbers:", primaryNumbers);
  console.log("Numero Oro:", numeroOro);
  console.log("Doppio Oro:", doppioOro);
  console.log("Extra:", extraNumbers);

  // --- Creazione dei record dettaglio ---
  // Supponiamo di voler salvare ogni blocco come record dettaglio separato.
  const details: any[] = [];
  
  if (primaryNumbers.length > 0) {
    details.push({
      type: "PRIMARY",
      numbers: primaryNumbers,
      parent_id: Number(saved?.id)
    });
  }
  if (numeroOro.length > 0) {
    details.push({
      type: "NUMERO ORO",
      numbers: numeroOro,
      parent_id: Number(saved?.id)
    });
  }
  if (doppioOro.length > 0) {
    details.push({
      type: "DOPPIO ORO",
      numbers: doppioOro,
      parent_id: Number(saved?.id)
    });
  }
  if (extraNumbers.length > 0) {
    details.push({
      type: "EXTRA",
      numbers: extraNumbers,
      parent_id: Number(saved?.id)
    });
  }
  
  // Salva i record dettaglio; assicurati che la funzione createDetail accetti l'oggetto
  for (let i = 0; i < details.length; i++) {
    await lotto10.createDetail(details[i]);
  }

  // Sincronizza le occorrenze, se presente la funzione (come per Lotto)
  await lotto10.syncOccurrence10ByLottoId(Number(saved?.id));

  return res.status(200).json(label);
}
