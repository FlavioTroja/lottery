import * as lotto5 from '../../services/lotto5.service';
import { setOccurence } from '../../services/occurrence.service';
import { formattedDateQuery } from '../../services/utils.service';

export default async function handler(req: any, res: any) {   

    let [ monthQuery, yearQuery ] = [req.query.month ?? 1, req.query.year ?? formattedDateQuery(new Date())];

    console.log("FETCH:",process.env.LOTTO5_CALENDAR_URL, {
      method: "post",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      //make sure to serialize your JSON body
      body: JSON.stringify({
        anno: yearQuery,
        mese: monthQuery
      })
    });

    const response = await fetch(`${process.env.LOTTO5_CALENDAR_URL}`, {
      method: "post",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      //make sure to serialize your JSON body
      body: JSON.stringify({
        anno: yearQuery,
        mese: monthQuery
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
    for (const res of result.giorniRaccolte.sort((a: { giorno: number; }, b: { giorno: number; }) => a.giorno - b.giorno)){
      for (let i = 1; i <= res.progressivoGiornaliero; i++) {
        console.log("FETCH:",process.env.LOTTO5_URL, {
          method: "post",
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          //make sure to serialize your JSON body
          body: JSON.stringify({
            data: yearQuery+(monthQuery < 10 ? '0' + monthQuery : monthQuery.toString())+(res.giorno < 10 ? '0' + res.giorno : res.giorno.toString()),
            progressivoGiornaliero: +i
          })
        });
      }
    }
    // const saved = await lotto5.create({
    //      code: `${extQuery}/${yearQuery}`,
    //      date: new Date(result.data),
    //      progressive_daily: result.progressivoGiornaliero,
    //      maximum_progressive_daily: result.massimoProgressivoGiornaliero,
    //      numbers: JSON.stringify(Array.from(result.numeriEstratti)),
    //      numbers_overtime: JSON.stringify(Array.from(result.numeriEstrattiOvertime)),
    //      special_number: result.numeroSpeciale,
    //      double_special_number: result.doppioNumeroSpeciale,
    //      gong_number: result.numeroGongEstratto
    // });

    //const numbers = Array.from(result.numeriEstratti);
    //numbers.forEach(num => setOccurence("LOTTO5", Number(num), new Date(result.data)));

    return res.status(200).json(result);
}
