// Chat info modification

let obj = JSON.parse($response.body);
obj.data.chatOfBot.shouldShowDisclaimer = false;

obj.data.chatOfBot.defaultBotObject.messageLimit.shouldShowSubscriptionRationale = false;

obj.data.chatOfBot.defaultBotObject.messageLimit.dailyLimit = null;
obj.data.chatOfBot.defaultBotObject.messageLimit.numMessagesRemaining = null;
obj.data.chatOfBot.defaultBotObject.messageLimit.monthlyLimit = null;
obj.data.chatOfBot.defaultBotObject.messageLimit.dailyBalance = null;
obj.data.chatOfBot.defaultBotObject.messageLimit.monthlyBalance = null;
obj.data.chatOfBot.defaultBotObject.messageLimit.shouldShowRemainingMessageCount = false;

$done({body: JSON.stringify(obj)});
