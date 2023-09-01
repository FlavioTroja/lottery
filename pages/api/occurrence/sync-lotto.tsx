import * as lotto from '../../../services/lotto.service';

export default async function handler(req: any, res: any) {    

    const extraction = await lotto.findLast();
    if (!extraction) {
        return res.status(404).json('Estrazione non trovata');
    }

    await lotto.syncOccurenceByLottoId(extraction.id ?? 0);
    return res.status(201)  ;

}