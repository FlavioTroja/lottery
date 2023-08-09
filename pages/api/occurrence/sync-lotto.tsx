import * as lotto from '../../../services/lotto.service';

export default async function handler(req: any, res: any) {    

    const extractions = await lotto.findAll();
    if (extractions.length === 0) {
        return res.status(404).json('Estrazione non trovata');
    }

    for (let i = 0; i < extractions.length; i++){
        await lotto.syncOccurenceByLottoId(extractions[i].id ?? 0);
    }
    return res.status(201);

}