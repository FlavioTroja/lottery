
import * as lotto from '../../services/lotto.service';
describe('Lotto Servive', () => {
    it('aggregate occurrence', async () => {
      const response = await lotto.aggregateOccurrence("BARI");
      console.log("AGG:", response);
      expect(response.length).toBe(90);
    })
  })