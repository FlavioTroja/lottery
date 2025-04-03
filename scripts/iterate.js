const delay = ms => new Promise(res => setTimeout(res, ms));

(async function() {

    const year = 2023;
    const prog = "lotto10";
    
    try {
        console.log("Starting iterate process @ ");

        let i = 1;
        while (true) {
            process.stdout.write(`iterating ${i}/${year} `);
            const response = await fetch(`http://localhost:3000/api/cron-${prog}?year=${year}&ext=${i}`);
            if (response.status === 404) {
                console.log(`No more extractions at ext ${i}. Terminating process.`);
                break;
            }
            process.stdout.write("Done!\n");
            // await delay(5000);
            i++;
        }

    } finally {
        console.log("Closing iterate process");
    }
})().catch(console.dir);



