const {sendMail } = require("./bin/helpers");

sendMail('proffnick1@gmail.com', 'testing the cron job general', 'If you can, we certainly can').then(sent => console.log(sent, 'sent ?')).catch(error => console.log(error, 'erorr ?'));

const cond = {$or:
                [
                    {$and:[{userType:"rider"},{isAdmin:true}]},
                    {$and:
                        [
                            {userType:"rider"},
                            {"approved":true},
                            {hasPendingRequest:false},
                            {lastSeen:{$gte:"2022-08-01T04:24:05.167Z"}},
                            {$or:[
                                {subRegion:"Abuja Municipal Area Council"},
                                {region:"Federal Capital Territory"}]
                            }
                        ]
                    }
                ]
            }
const niceCond = {$and:[{$and:{$or:[{_type:"DEBIT"},{_type:"CREDIT"}]}},{$and:[{_date:{$gte:"2022-07-31T14:17:52.227Z"}},{_date:{$lte:"2022-08-15T14:17:52.227Z"}}]},{$and:[{_userid:"62ba63687a9e90ac1f28459a"}]}]}