import { LottoOccurrence } from '../../../lib/planetscale';
import * as lottoService from '../../../services/lotto.service';
import * as utils from '../../../services/utils.service';

export default async function handler(req: any, res: any) {   
    
    const ext = req.query.ext;
    const city = req.query.city;

    if (!ext || !city) {
        throw new Error("Parameters not found");
    }

    const lottoOccurrence = await lottoService.findOccurence(ext, city);

    console.log(JSON.stringify(lottoOccurrence, null, 4));
    if (!lottoOccurrence) {
        const saved = await lottoService.createOccurence({
            city,
            ext,
            occurrence: 1,
            date: `[${utils.formattedDate(new Date())}]`
        }); 

        return res.status(201).json(saved);
    }


    const date = JSON.parse(lottoOccurrence.date);
    const addDate = [ ...date, utils.formattedDate(new Date())];
    const updated = await lottoService.updateOccurrence(
        lottoOccurrence.id, 
        (lottoOccurrence.occurrence ?? 0) + 1,
        addDate.toString()
    ); 

    return res.status(200).json(updated);
}