const delay = ms => new Promise(res => setTimeout(res, ms));

(async function() {

    const year = 2019;
    
    try {
        console.log("Starting iterate process @ ");

        for (let i = 1; i <= 156; i++) {

            process.stdout.write(`iterating ${i}/${year} `);
            await fetch(`http://localhost:3000/api/cron?year=${year}&ext=${i}`);
            process.stdout.write("Done!\n");
            //await delay(5000);
        }
    } finally {
        console.log("Closing iterate process");
    }
})().catch(console.dir);



