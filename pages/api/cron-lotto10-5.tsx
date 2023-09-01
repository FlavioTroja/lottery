import * as lotto from '../../services/lotto.service';
import { formattedDateQuery } from '../../services/utils.service';

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

    const response = await fetch(`${process.env.LOTTO10_5_URL}`, {
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
    

    console.log("QUI: ", result);

    // const saved = await lotto.create({
    //     code: `${extQuery}/${yearQuery}`,
    //     date,
    //     label
    // });

    return res.status(200).json(result);
}