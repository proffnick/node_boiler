const { apiClient } = require('../api/client');
const config        = require('config');

    function sendMail(to, subject, message){
		
        const body = {
            "email": to,
            "subject": subject,
            "message": message
        };
    
        return new Promise((resolve, reject) => {
            apiClient.post(config.get('sendMailPath')+`/send`, body).then((response) => {
                console.log(response.data, response.ok);
                resolve(response.data);
            }).catch((error) => {
                resolve(error.message);
            }); 
        });   
    }
    // define sms function
    function sendSMS(to, sms, channel = "dnd",sender = "N-Alert"){
        var data = {
            "to":to,
            "from":sender,
            "sms":"PSALOGISTICS: "+sms,
            "type":"plain",
            "api_key":config.get('termiiKey'),
            "channel": channel// generic WhatsApp, dnd      
          };
        //var data = JSON.stringify(data);
        return  new Promise((resolve, reject) => {
            const url = (sender === 'N-alert') ? config.get('termiiSendUrl'): config.get('termiiSendUrlSMS');
           apiClient.post(url, data).then( (response) => {
               //console.log(response.data);
               resolve(response);
           } ).catch( (error) => {
               if(error.response) console.log(error.response);
               resolve(response);
           } );
        });
    }

    function shuffleArray(array) {
        let currentIndex = array.length,  randomIndex;
      
        // While there remain elements to shuffle.
        while (currentIndex != 0) {
      
          // Pick a remaining element.
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex--;
      
          // And swap it with the current element.
          [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
        }
      
        return array;
      }

      function makeid() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      
        for (var i = 0; i < 16; i++)
          text += possible.charAt(Math.floor(Math.random() * possible.length));
      
        return text;
      }

    module.exports = {
        sendMail,
        sendSMS,
        shuffleArray,
        makeid
    }