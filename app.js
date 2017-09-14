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
 
// LUIS model for intent and entities extraction
//var model = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/bf0d182e-6437-497a-9998-5cb2c96e0f1c?subscription-key=3c96b72c44d947fea660e0ecf0560be0&staging=true&verbose=true&timezoneOffset=0&q=';
var model = process.env.LUIS_URL || 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/7a7308a7-7f10-48b9-92ea-7cf400006895?subscription-key=3c96b72c44d947fea660e0ecf0560be0&verbose=true&timezoneOffset=0&q=';
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
    intro: 'Hi %s, I\'m Benjamin BOTton....' ,
    get_started: ' There are a few things I need from you, do you have few minutes to go through it now?',
    help_prompt: 'Hi %s, how can I help you today?',
    nice_day: 'Have a nice day.',
    contact_detail: 'Last thing, we have the following details on file for you:'+
                    '\n\n\n  * Mobile : %s'+
                    '\n\n\n  * Email  : %s'
}

var scenario = ['Laptop','Building','Car']
//var customers = ['22', '39', '61'];
 
// Utility to start demo and help navigate between scenarios
bot.dialog('dialogStartDemo', [
    function (session) { 
   
        builder.Prompts.choice(session, messages.select_scenario, scenario,
            {listStyle: builder.ListStyle.button});
    },
    function (session, results) {
        session.userData.policy = pd.lookupPolicy(results.response.entity);
        session.beginDialog('dialogGreetings');
    }
]);
 
bot.dialog('dialogGreetings', [
    function (session) {
        // for demo
        session.conversationData.firstTime = true;
        // For demo purpose we don't persist beyond conversation
        if (session.conversationData.firstTime) {
            session.send(messages.intro, session.userData.policy.firstName);
            //session.conversationData.firstTime = false; 
        }
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
                                session.endConversation(messages.nice_day);
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
                         session.endConversation();
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
                                                     session.endConversation();
                                                 } 
                                      )  
            

bot.dialog('dialogBuilding', [
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
                                session.endConversation(messages.nice_day);
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

    function (session, results, next) { 
        //session.sendTyping();
        builder.Prompts.text(session, 'Sure, tell me what you would like to know?');
   
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

        else if (session.userData.policy.scenario === 'Car') 
            {
                session.beginDialog('dialogCar');
             }

    else {session.send('I\'m still in training and not sure i can answer your question confidently.  Try again?')
    }
},

/// Dialog close
    function (session, result, next) {
        //session.sendTyping();
        session.endConversation(messages.nice_day);
    } , 
]); 