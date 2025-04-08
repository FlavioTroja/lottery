import type { NextApiRequest, NextApiResponse } from 'next';
import * as lotto10 from '../../services/lotto10.service';
import { formattedDate } from '../../services/utils.service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
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
      
    const payload = {
      data: "20250101", // formato YYYYMMDD; puoi derivarlo dalla data corrente se serve
      progressivoGiornaliero: 1  // progressivo giornaliero da inviare
    };

    // Effettua la POST all'endpoint del 10‑e‑lotto
    const response = await fetch(
      `${process.env.LOTTO5_URL}`,
      {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      return res.status(500).json({ error: "Failed to fetch extraction data" });
    }

    // Ottieni il JSON di risposta
    const dataJson = await response.json();

    // Estrai e converte la data (campo "data" in ms)
    const extractionTimestamp = dataJson.data;
    const extractionDate = new Date(extractionTimestamp);

    // Estrai il progressivo giornaliero
    const progressivoGiornaliero = dataJson.progressivoGiornaliero;
    
    // Costruisci il label (puoi modificarlo come preferisci)
    const label = `Estrazione 10eLotto n° ${progressivoGiornaliero} del ${formattedDate(extractionDate)}`;

    // Crea il record principale per l'estrazione del 10‑e‑lotto
    const saved = await lotto10.create({
      code: `${progressivoGiornaliero}/${extractionDate.getFullYear()}`,
      date: extractionDate,
      label,
      type: 'LOTTO5'
    });

    // Converte gli array di numeri (i campi sono array di stringhe)
    const primaryNumbers: number[] = dataJson.numeriEstratti.map((s: string) => parseInt(s, 10));
    const overtimeNumbers: number[] = dataJson.numeriEstrattiOvertime.map((s: string) => parseInt(s, 10));
    const numeroSpeciale: number = dataJson.numeroSpeciale;
    const doppioNumeroSpeciale: number = dataJson.doppioNumeroSpeciale;

    // Prepara i dettagli da salvare, usando il nuovo modello
    const details = [];
    if (primaryNumbers && primaryNumbers.length > 0) {
      details.push({
        type: "PRIMARY",
        numbers: primaryNumbers,
        parent_id: Number(saved?.id)
      });
    }
    if (overtimeNumbers && overtimeNumbers.length > 0) {
      details.push({
        type: "EXTRA", // oppure "OVERTIME" se preferisci un nome diverso
        numbers: overtimeNumbers,
        parent_id: Number(saved?.id)
      });
    }
    if (numeroSpeciale !== null && !isNaN(numeroSpeciale)) {
      details.push({
        type: "NUMERO ORO",
        numbers: [numeroSpeciale],
        parent_id: Number(saved?.id)
      });
    }
    if (doppioNumeroSpeciale !== null && !isNaN(doppioNumeroSpeciale)) {
      details.push({
        type: "DOPPIO ORO",
        numbers: [doppioNumeroSpeciale],
        parent_id: Number(saved?.id)
      });
    }

    // Salva i dettagli
    for (const detail of details) {
      await lotto10.createDetail(detail);
    }

    // Sincronizza le occorrenze per il 10‑e‑lotto (funzione simile a quella per il lotto tradizionale)
    await lotto10.syncOccurrence10ByLottoId(Number(saved?.id));

    return res.status(200).json({ label, details });
  } catch (error) {
    console.error("Error in cron 10eLotto:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
