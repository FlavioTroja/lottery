const delay = ms => new Promise(res => setTimeout(res, ms));

(async function() {

    const year = 2020;
    const prog = "lotto";
    
    try {
        console.log("Starting iterate process @ ");

        for (let i = 1; i <= 365; i++) {

            process.stdout.write(`iterating ${i}/${year} `);
            await fetch(`http://localhost:3000/api/cron-${prog}?year=${year}&ext=${i}`);
            process.stdout.write("Done!\n");
            //await delay(5000);
        }
    } finally {
        console.log("Closing iterate process");
    }
})().catch(console.dir);



