export default async function handler(req: any, res: any) {
  await fetch('https://lotto.overzoom.it/api/cron-lotto');
  await fetch('https://lotto.overzoom.it/api/cron-lotto10');
  await fetch('https://lotto.overzoom.it/api/cron-millionday');
  
  res.status(200).json({ message: "Tutti i cron sono stati eseguiti" });
}
