async function getData() {

    let myHeaders = new Headers();
    myHeaders.append("User-Agent", "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/114.0");
    myHeaders.append("Accept", "*/*");
    myHeaders.append("Accept-Language", "it");
    myHeaders.append("Accept-Encoding", "gzip, deflate, br");
    myHeaders.append("X-Requested-With", "XMLHttpRequest");
    myHeaders.append("Content-Type", "text/plain;charset=UTF-8");
    myHeaders.append("Content-Length", "0");
    myHeaders.append("Origin", "https://www.adm.gov.it");
    myHeaders.append("Connection", "keep-alive");
    myHeaders.append("Referer", "https://www.adm.gov.it/portale/monopoli/giochi/gioco-del-lotto/lotto_g/lotto_estr?prog=76&anno=2023");
    myHeaders.append("Sec-Fetch-Dest", "empty");
    myHeaders.append("Sec-Fetch-Mode", "cors");
    myHeaders.append("Sec-Fetch-Site", "same-origin");
    myHeaders.append("Sec-GPC", "1");
    myHeaders.append("Pragma", "no-cache");
    myHeaders.append("Cache-Control", "no-cache");
    myHeaders.append("Cookie", "JSESSIONID=4AoevmiqKR1iaePlzMid3t18Iuxa_EK3GV1ArieN.node8; GUEST_LANGUAGE_ID=it_IT; COOKIE_SUPPORT=true");

    const requestOptions = {
        method: 'POST',
        headers: myHeaders
    };

    const year = `_it_sogei_wda_web_portlet_WebDisplayAamsPortlet_anno=2023`;
    const code = `_it_sogei_wda_web_portlet_WebDisplayAamsPortlet_prog=75`;
    const res = await fetch(`${process.env.LOTTERY_URL}&${year}&${code}`, requestOptions);
    // The return value is *not* serialized
    // You can return Date, Map, Set, etc.
   
    // Recommendation: handle errors
    if (!res.ok) {
      // This will activate the closest `error.js` Error Boundary
      throw new Error('Failed to fetch data');
    }
   
    console.log(res.text());
    return res.text();
  }

export default function handler(req, res) {    
    return (<>
        getData()
    </>)
    //res.status(200).end(getData());
}