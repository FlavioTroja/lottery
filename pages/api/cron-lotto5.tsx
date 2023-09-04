import * as lotto from '../../services/lotto.service';
import { formattedDateQuery } from '../../services/utils.service';
import {Datetime} from 'luxon';

export default async function handler(req: any, res: any) {    
    
    let [ extQuery, yearQuery ] = [req.query.ext ?? 0, req.query.year ?? formattedDateQuery(new Date())];


    if (!req.query.ext && !req.query.year) {
      //const last = await lotto.findLast();

      // if (last) {
      //   [ extQuery, yearQuery ] = last?.code?.split("/");
      // }

      extQuery = !!extQuery ? +extQuery + 1 : 1;
      yearQuery = yearQuery || formattedDateQuery(new Date());
    }

    // const found = await lotto.findByCode(`${extQuery}/${yearQuery}`);
    // if (found) {
    //   return res.status(201).json('Estrazione già presente');
    // }

    const response = await fetch(`${process.env.LOTTO5_URL}`, {
      method: "post",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      //make sure to serialize your JSON body
      body: JSON.stringify({
        data: yearQuery,
        progressivoGiornaliero: extQuery
      })
    });
    // The return value is *not* serialized
    // You can return Date, Map, Set, etc.
   
    // Recommendation: handle errors
    if (!response.ok) {
      // This will activate the closest `error.js` Error Boundary
      throw new Error('Failed to fetch data');
    }
   
    const result = await response.json();
  

    console.log(JSON.stringify({
      code: `${extQuery}/${yearQuery}`,
      date: result.data,
      progressive_daily: result.progressivoGiornaliero,
      maximum_progressive_daily: result.massimoProgressivoGiornaliero,
      numbers: result.numeriEstratti,
      numbers_overtime: result.numeriEstrattiOvertime,
      special_number: result.numeroSpeciale,
      double_special_number: result.doppioNumeroSpeciale,
      gong_number: result.numeroGongEstratto
 }, null, 4));

    const saved = await lotto.createLotto5({
         code: `${extQuery}/${yearQuery}`,
         date: Datetime.fromMillis(result.data).toISO(),
         progressive_daily: result.progressivoGiornaliero,
         maximum_progressive_daily: result.massimoProgressivoGiornaliero,
         numbers: JSON.stringify(Array.from(result.numeriEstratti)),
         numbers_overtime: JSON.stringify(Array.from(result.numeriEstrattiOvertime)),
         special_number: result.numeroSpeciale,
         double_special_number: result.doppioNumeroSpeciale,
         gong_number: result.numeroGongEstratto
    });

    return res.status(200).json(saved);
}