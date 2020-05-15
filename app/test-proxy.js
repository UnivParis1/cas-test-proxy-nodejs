const casServiceUrl = 'https://cas-test.univ-paris1.fr/cas';

const ticket = getTicket();
const ourService = document.location.href.replace(/[&?]ticket=.*/, '');
document.getElementById("info").innerText = "For " + casServiceUrl;

if (!ticket) {
    document.location.href = casServiceUrl + "/login?service=" + encodeURIComponent(ourService);
} else {
    fetch(ourService + "/serviceValidate?ticket=" + ticket + "&service=" + ourService + '&pgtUrl=' + ourService + '/pgtCallback').then(r => r.text()).then(casResponse => {
        document.getElementById("pre").innerText += casResponse + "\n\n\n";
        const m = casResponse.match(/<cas:user>(.*)</);
        if (m) {
            const user = m[1];
            document.getElementById("info").innerText += "\nGot user " + user;
        }
        const m2 = casResponse.match(/<cas:proxyGrantingTicket>(.*)</);
        if (m2) {
            const pgtIou = m2[1];
            document.getElementById("info").innerText += "\nGot pgtIou " + pgtIou;

            fetch(ourService + "/pgts").then(r => r.json()).then(pgts => {
                const pgt = pgts[pgtIou]
                document.getElementById("info").innerText += "\nGot pgt " + pgt;
                if (pgt) {
                    fetch(ourService + "/proxy?pgt=" + pgt + "&targetService=imap://localhost").then(r => r.text()).then(casResponse => {
                        document.getElementById("pre").innerText += casResponse + "\n\n\n";

                        const m = casResponse.match(/<cas:proxyTicket>(.*)</);
                        if (m) {
                            const pt = m[1];
                            document.getElementById("info").innerText += "\nGot proxy ticket " + pt;

                            fetch(ourService + "/proxyValidate?ticket=" + pt + "&service=imap://localhost").then(r => r.text()).then(casResponse => {
                                document.getElementById("pre").innerText += casResponse + "\n\n\n";

                                const m = casResponse.match(/<cas:user>(.*)</);
                                if (m) {
                                    const user = m[1];
                                    document.getElementById("info").innerText += "\nProxy got user " + user;
                                }
                                const m2 = casResponse.match(/<cas:proxy>(.*)</);
                                if (m2) {
                                    const proxy = m2[1];
                                    document.getElementById("info").innerText += "\nProxy got proxied by " + proxy;
                                }
                        
                            })
                        }
                    });
                }

            });

        }
    });
}

function getTicket() {
    const href = document.location.href;
    const m = href.match(/\bticket=(.*)/);
    return m && m[1];
}

