// This loads environment variables from .env file -- uncomment for production /
// remote bot server
// Comment for local testing
//require('dotenv-extended').load();
 
// TODO
// some utility intent for showing demo
// e.g. choosing users, show underlying data
 
// Setup Restify Server
var restify = require('restify');
var builder = require('botbuilder');
var pd = require('./policy-details'); 
var Promise = require('bluebird');
var sprintf = require('sprintf-js').sprintf; 
var fs = require('fs');
var util = require('util');

 
// Proxy settings
// var globalTunnel = require('global-tunnel');
 //globalTunnel.initialize();
//=========================================================
// Bot Setup
//=========================================================
// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});
// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
 
server.post('/api/messages', connector.listen());
var bot = new builder.UniversalBot(connector);
 
// LUIS model 
var model = process.env.LUIS_URL;
var luis = new builder.LuisRecognizer(model);
 
//globalTunnel.end();
// Create our IntentDialog and add recognizers
// won't work properly without this!!
var demoRecognizer = new builder.RegExpRecognizer( "startdemo", /^(startdemo)/i);
var intents = new builder.IntentDialog({ recognizers: [luis, demoRecognizer] });
intents.onDefault('dialogStartDemo');
 
// Match our "Greetings" and "Farewell" intents with their dialogs
// Each intent must be handled by a handler, i.e. IntentDialog
intents.matches('goodbye', 'dialogBye');
intents.matches('greeting', 'dialogGreetings');
intents.matches('startdemo', 'dialogStartDemo');
 
bot.dialog('/', intents);
 
bot.use(builder.Middleware.dialogVersion({
            version: 1.0,
            message: 'Conversation restarted by a main update',
            resetCommand: /^reset/i
        }));
 
//=========================================================
// Bots Dialogs
//=========================================================
// Messages to use
var messages = {
    select_scenario: 'Please select a scenario for the labhack demo',
    intro: 'Hi %s, I\'m Benjamin Botton....' ,
    help_prompt: 'Hi %s, how can I help you today?',

}

/*
var scenario = ['Laptop','Building']
//var customers = ['22', '39', '61'];
 
// Utility to start demo and help navigate between scenarios
bot.dialog('dialogStartDemo', [
 /*   function (session) { 
   
        builder.Prompts.choice(session, messages.select_scenario, scenario,
            {listStyle: builder.ListStyle.button});
    },
  
    function (session, results) {
        session.userData.policy = pd.lookupPolicy(results.response.entity);
        session.beginDialog('dialogGreetings');
    }
]);
*/

bot.dialog('dialogGreetings', [
    function (session) {
        // for demo
        session.beginDialog('dialogMain');
    }
]);
bot.dialog('dialogBye', [
    function (session) {
        session.endDialog('Farewell!');
    }
]);
bot.dialog('Help', [
    function (session) {
      session.endDialog("I can't help you right now...");
    }
]); 

/*

bot.dialog('dialogLaptop', [
    function (session, results, next) { 
                session.send('Great question!');
                //session.sendTyping();
                session.send('I can see here that you have Suncorp Classics Advantages Home and Contents policy and that you have taken out the optional Personal Valuables Unspecified Items Cover.');
               //session.sendTyping();
                session.send('With this cover we would pay up to $1,000 towards your damaged laptop.');
                //session.sendTyping();
                builder.Prompts.text(session, 'Do you know how much your laptop is worth?');
            },
        
            function (session, result) {
                session.send('You might want to consider adding specific items cover to your policy so that you are covered for the full value of your laptop.');
                //session.sendTyping();
                builder.Prompts.choice(session, 'Would you like me to take you to your policy so that you can obtain a quote for this additional cover?', 'Yes please!|No thanks',
                        {listStyle: builder.ListStyle.button}); 
            },
            
            function (session, result) {
                            if (result.response.entity === 'Yes please!')  {
                                session.send('I will take you there now....');
                                //session.sendTyping();
                                session.beginDialog('dialogSUNUpdateCover');
                            } else {
                                session.endDialogWithResult();
                            }
                        },
]); 



bot.dialog('dialogSUNUpdateCover' ,  

    function (session ) {  
                                
        if (session.message && session.message.value ) {
              // A Card's Submit Action obj was received
             processSubmitAction(session, session.message.value);
               return;
                }
                                    
                                            var card = {
                                                'contentType': 'application/vnd.microsoft.card.adaptive',
                                                'content': {
                                                    "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
                                                    "type": "AdaptiveCard",
                                                    "version": "0.5",
                                                    "body": [
                                                        {
                                                 
                                                            "type": "ColumnSet",
                                                            "columns": [
                                                                {
                                                                    "type": "Column",
                                                                    "size": 2,
                                                                    "items": [
                                                                        {
                                                                            "type": "TextBlock",
                                                                            "text": "Marketplace",
                                                                            "weight": "normal",
                                                                            "size": "Large"
                                                                        },
                                                                       
                                                                        {
                                                                            "type": "TextBlock",
                                                                            "text": "Click the link below to update your cover.",
                                                                            "wrap": true
                                                                        }
                                                                    ]
                                                                },
                                                                {
                                                                    "type": "Column",
                                                                    "size": 1,
                                                                    "items": [
                                                                        {
                                                                            "type": "Image",
                                                                            "url": "https://www.suncorp.com.au/content/dam/suncorp/corporate/images/logos/Suncorp_New_Logo.png",
                                                                            "size": "auto"
                                                                        }
                                                                    ]
                                                                }
                                                            ]
                                                        }
                                                    ],
                                                    "actions": [
                                                        {
                                                            "type": "Action.OpenUrl",
                                                            "title": "Update my cover",
                                                            "url": "https://www.suncorp.com.au/insurance/manage-your-policy.html#home-contents-landlord"
                                                        }
                                                    ]
                                                }
                                             };
                      var msg = new builder.Message(session)
                      .addAttachment(card);
                         session.send(msg); 
                   session.beginDialog()
                     } 
          )  

 function processSubmitAction(session, value) {
   var defaultErrorMessage = 'Please complete all the search parameters';
                                switch (value.type) { 
                                        
                                    default:
                                        // A form data was received, invalid or incomplete since the previous validation did not pass
                                        session.send(defaultErrorMessage);
                                }
                            }



    bot.dialog('dialogAAMIReplace' ,  
                            
                                function (session ) {  
                                                            
                                    if (session.message && session.message.value ) {
                                          // A Card's Submit Action obj was received
                                         processSubmitAction(session, session.message.value);
                                           return;
                                            }
                                                                
                                                                        var card = {
                                                                            'contentType': 'application/vnd.microsoft.card.adaptive',
                                                                            'content': {
                                                                                "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
                                                                                "type": "AdaptiveCard",
                                                                                "version": "0.5",
                                                                                "body": [
                                                                                    {
                                                                             
                                                                                        "type": "ColumnSet",
                                                                                        "columns": [
                                                                                            {
                                                                                                "type": "Column",
                                                                                                "size": 2,
                                                                                                "items": [
                                                                                                    {
                                                                                                        "type": "TextBlock",
                                                                                                        "text": "Marketplace",
                                                                                                        "weight": "normal",
                                                                                                        "size": "Large"
                                                                                                    },
                                                                                                   
                                                                                                    {
                                                                                                        "type": "TextBlock",
                                                                                                        "text": "Click the link below to get a quote.",
                                                                                                        "wrap": true
                                                                                                    }
                                                                                                ]
                                                                                            },
                                                                                            {
                                                                                                "type": "Column",
                                                                                                "size": 1,
                                                                                                "items": [
                                                                                                    {
                                                                                                        "type": "Image",
                                                                                                        "url": "https://www.aami.com.au/content/dam/suncorp/insurance/aami/logos/aami-crc-icon.png",
                                                                                                        "size": "auto"
                                                                                                    }
                                                                                                ]
                                                                                            }
                                                                                        ]
                                                                                    }
                                                                                ],
                                                                                "actions": [
                                                                                    {
                                                                                        "type": "Action.OpenUrl",
                                                                                        "title": "Get a quote",
                                                                                        "url": "https://www.aami.com.au/home-insurance/building-and-contents.html"
                                                                                    }
                                                                                ]
                                                                            }
                                                                         };
                                                  var msg = new builder.Message(session)
                                                  .addAttachment(card);
                                                     session.send(msg); 
                                                     session.endDialogWithResult();
                                                 } 
                                      )  
            

bot.dialog('dialogBuilding', [
 

    function (session, results, next) { 
        builder.Prompts.text(session, 'Was there anything else I can help you with?');
    }
     
    function (session, results, next) { 
                //session.send('Great question!');
                //session.sendTyping();
                session.send('Yes, I can see that your GIO Home and Contents insurance covers building damage of up to $500,000');
                //session.sendTyping();
                session.send('Did you know that AAMI comprehensive insurance covers the complete replacement of your home with no limit.');
                //session.sendTyping();
                builder.Prompts.choice(session, 'Is this something you might be interested in?', 'Yes Please!|No thanks',
                {listStyle: builder.ListStyle.button}); 
            },
        
            function (session, result) {
                            if (result.response.entity === 'Yes Please!')  {
                                session.send('I will take you there now....');
                                //session.sendTyping();
                                session.beginDialog('dialogAAMIReplace')
                            } else {
                                session.endDialogWithResult();
                            }
                        },
]); 

bot.dialog('dialogCar', [
    function (session, results, next) { 
                //session.send('Great question!');
                //session.sendTyping();
                session.send('Does this have anything to do with your transactions at 3am last night? :o');
                //session.sendTyping();
                session.send('You may be suprised to know that your replacement keys are actually covered by your AAMI comprehensive car insurance!');
                //session.sendTyping();
                session.send('We\'ll cover you for up to $1,000 to replace and recode your keys.');
                //session.sendTyping();
                session.send('I can see that you also have the optional AAMI Roadside Assist, so we can send someone out to let you into your car as well!.');
                //session.sendTyping();
                session.endConversation();
    
            }
]); 
 
 // Main journey for checking for coverage
bot.dialog('dialogMain', [  

    function (session) { 
        //session.sendTyping();
        builder.Prompts.text(session, 'How can I help you today?');
    },

 //
    function (session, results, next) { 
   if (session.userData.policy.scenario === 'Laptop') 
    {     session.beginDialog('dialogLaptop');
    } 

    else if (session.userData.policy.scenario === 'Building') 
        {
            session.beginDialog('dialogBuilding');

        }

    /*    else if (session.userData.policy.scenario === 'Car') 
            {
                session.beginDialog('dialogCar');
                   }

                   

    else {session.send('I\'m still in training and not sure i can answer your question confidently.  Try again?')
    }
},
*/

/// Main journey for checking for coverage
bot.dialog('dialogMain', [  

    function (session) { 
        //session.sendTyping();
        builder.Prompts.text(session, 'Hi Mark, I\'m Benjamin Botton.  How can I help you today?');
    },

 //
 function (session, results, next) { 
    session.send('Great question!');
    //session.sendTyping();
    session.send('I can see here that you have Suncorp Classics Advantages Home and Contents policy and that you have taken out the optional Personal Valuables Unspecified Items Cover.');
   //session.sendTyping();
    session.send('With this cover we would pay up to $1,000 towards your damaged laptop.');
    //session.sendTyping();
    builder.Prompts.text(session, 'Do you know how much your laptop is worth?');
},

function (session, results, next) {
    session.send('You might want to consider adding specific items cover to your policy so that you are covered for the full value of your laptop.');
    //session.sendTyping();
    builder.Prompts.choice(session, 'Would you like me to take you to your policy so that you can obtain a quote for this additional cover?', 'Yes please!|No thanks',
            {listStyle: builder.ListStyle.button}); 
},

/*
function (session, results,next) {
                if (result.response.entity === 'Yes please!')  {
                    session.send('I will take you there now....');
                    //session.sendTyping();
                    //session.beginDialog('dialogSUNUpdateCover');
                } else {
                    next({response :""})
                }
            },
*/
   function (session, results, next) { 
            //session.sendTyping();
            session.send('I will take you there now....');

            var welcomeCard = new builder.HeroCard(session)
            .title('Suncorp Market Place')
            .subtitle('Upgrade your cover...')
            .images([
                new builder.CardImage(session)
                    .url('https://www.suncorp.com.au/content/dam/suncorp/corporate/images/logos/Suncorp_New_Logo.png')
                
            ])
         ;
        
        session.send(new builder.Message(session)
            .addAttachment(welcomeCard));
            builder.Prompts.text(session, 'Was there anything else I can help you with?');
            },
/*
    function (session, results, next) { 
        //session.sendTyping();
        session.send('I will take you there now.... placeholder');
        builder.Prompts.text(session, 'Was there anything else I can help you with?');
        },

  */      


        function (session, results, next) { 
            //session.send('Great question!');
            //session.sendTyping();
            session.send('Yes, I can see that your GIO Home and Contents insurance covers building damage of up to $500,000');
            //session.sendTyping();
            session.send('Did you know that AAMI comprehensive insurance covers the complete replacement of your home with no limit.');
            //session.sendTyping();
            builder.Prompts.choice(session, 'Is this something you might be interested in?', 'Yes Please!|No thanks',
            {listStyle: builder.ListStyle.button}); 
        },
    
        function (session, results, next) { 
            //session.sendTyping();
            session.send('I will take you there now....');

            var welcomeCard = new builder.HeroCard(session)
            .title('Suncorp Market Place')
            .subtitle('Get a quote...')
            .images([
                new builder.CardImage(session)
                    .url('data:image/jpeg;base64,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')
                
            ])
         ;
        
        session.send(new builder.Message(session)
            .addAttachment(welcomeCard));
           // builder.Prompts.text(session, 'Was there anything else I can help you with?');
            },
]); 
    
 