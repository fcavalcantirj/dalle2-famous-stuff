const { GoogleSpreadsheet } = require('google-spreadsheet');


// Initialize the sheet - doc ID is the long id in the sheets URL
const doc = new GoogleSpreadsheet('1T-ZRHGHabUe_sedP-e-V4Tj_5kU7dKzU8CaxsgduEXY');



const main = async () => {

  let key = process.env.GOOGLE_PRIVATE_KEY

  console.log(key)

  // let json = JSON.parse(Buffer.from(_json, 'base64').toString('ascii'))

  // console.log(Buffer.from(_json).toString('base64'))

  // console.log(Buffer.from('{"type": "service_account","project_id": "openai-373213","private_key_id": "5e75c6ff73cbbc1c00b498b67437a4468e092d80","private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC5P9GDnDu1yR9k\neggBf0/9WROhlAQAuikZFl3EUwhp+Ehb874eVQ5DWpfYouUJHI/h206NqX+XvXEG\nxXc16z4aympSH5XLlrLahymqvVJQ0G1Wr67g25minSkx3N4vmLutanmdnMDHiXCO\nm2tJzYzsDlnJxnmUFFxmj8RHKJBggG2iZdTN2Q1c12yFl3N5y/eZj3RNVw5vupn4\nbshSvcYgat47Zt7TMXKV8oCqYf4xEtigktrVS/JpjRfnep5U5dC6hLApOgxi+quC\njLIHKi1+R+bmgXqJaiMovdG6OR/8g90yOHKMCgZkuOQ6h+hKlzYtxI+NRer9cC8A\nd78U4VjXAgMBAAECggEAHst3mj/KA0WsVMkedJVD6FM6+rS+15oaw+Necgj1kJwn\n9zU1KRitls/EB0zI8zNOzdZloBIJtmFVHTGNSCbTe6OjegRrI91o3P/0EsCHIw0K\n6AqrcRDAYPJsSzAytUnYBRN6pRNOTr1Puz0l4C5t2z3lei/mvRGHbLtAfy3Elm3q\nohWdt7y7FTxaaJyHd/CCiypyLdXHSb0SRztC8KZX9MjnQwk6IGR3l0TMlnKe2vYq\nAnZ2KLK6GgyuLUSTMVDy0gXW/NH5DrdgSLD5Ylnoq+PTP040U06sg+1BsW1cDhP8\npOPsFO29Q9aFn+wIK9/B0+fmoFEOAu47IFDd0qnsIQKBgQDdZ/o/cs/bo/iu+DpG\nJtLtuzLXnuoqqwL1c+Czdqf7a7LGf8nsjMmjL9AN3joPCpvxoIO624lOi8R6aeJw\nuHWh2RPvOhS1VxeQjD0vjCjg70NJ7WMBfCNrIMMeETIMv3vlIiOZdESXXS9zPWi7\n5GAQIW9G7e7ggNRw0bmHS8y54QKBgQDWMZpEXHJvRrTB+H5FsT9nbBE419R6ahCk\nK4IO5K3DZR9jpRck+CeXGo42zRFJYYnIo0EIMRnbpPJmt78Og4/qAiViHZc8+Im6\n9Ydx9CSCqvIR6IfPznpEH9vVkE5wdPGg+1TAcmVVbSvQZ3JszEr26z4RGmIu37e3\nTuyBgpGZtwKBgB41h7GMisvfLZlCCUF1HqaNOjytVCoKN1ciPnB+KiFl6ninCvgZ\npZF8fpjFz4op2mk3i4G9Xpi2/VHujJTwtiwlIFEtzZGIlpCEcfzA1PsL6lR17WJQ\ne8ysJbM+iWOv5Mm4xL61XH6CmmzQ3i90056f0T0OTd+X9GSIWRYaw45BAoGBAMt4\nc0NdTpfGYw+gLtOlfMWSMwn8fSuMdiJ98h6TvT1QYnEV8tZ7paA06cPFKha7QVgH\nPU+61QWBu4M4KZZwA9YYE8sQsQqKTsv7UZ8+fTBjk3DPo7QUQLFWUk6dtuW9MYvr\nNKdcBEcSXfyrSFdx+gR1k5BLr9k3TB4mKyUcE5QhAoGAG+zbESMfiOdTxtSVJkFo\nQ/p9WJEKoJrTzqn/WW/3gDfoK7QrC9Xot3BAFzRQki4eItCuc6m7vENi/CjC6w37\nFDmDRmFye2atpAWIvchGLz+V2c60pb9Aq0On4xA7gh9jmI/Ym6WhJnjDlN2puJeX\n4Bji+lxWgShPvC1cKXEwHMQ=\n-----END PRIVATE KEY-----\n","client_email": "openapi@openai-373213.iam.gserviceaccount.com","client_id": "115578558415056899849","auth_uri": "https://accounts.google.com/o/oauth2/auth","token_uri": "https://oauth2.googleapis.com/token","auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/openapi%40openai-373213.iam.gserviceaccount.com"}').toString('base64'));
  // console.log(`#`)

  // console.log(Buffer.from(process.env.GOOGLE_PRIVATE_KEY, 'base64').toString('ascii'))


// const creds = require('/Users/fcavalcanti/Downloads/openai-373213-5e75c6ff73cb.json'); // the file saved above
// const creds = require('/Users/fcavalcanti/Downloads/openai-373213-5e75c6ff73cb.json'); // the file saved above
// await doc.useServiceAccountAuth(json);

  // const key = Buffer.from(process.env.GOOGLE_PRIVATE_KEY, 'base64').toString('ascii').replace(/\\n/g, "\n")
  // const key = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n")

  // console.log(key)

    // Initialize Auth - see https://theoephraim.github.io/node-google-spreadsheet/#/getting-started/authentication
  await doc.useServiceAccountAuth({
    // env var values are copied from service account credentials generated by google
    // see "Authentication" section in docs for more info
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: key.replace(/\\n/g, "\n"),
  });

  await doc.loadInfo(); // loads document properties and worksheets
  console.log(doc.title);
  // await doc.updateProperties({ title: 'renamed doc' });

  const sheet = doc.sheetsByIndex[0]; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]
  console.log(sheet.title);
  console.log(sheet.rowCount);

  // adding / removing sheets
  // const newSheet = await doc.addSheet({ title: 'hot new sheet!' });
  // await newSheet.delete();

}

main()