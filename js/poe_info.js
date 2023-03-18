# Poe Enhancement

let obj = JSON.parse($response.body);
obj.data.viewer.enableSuggestedReplies = false;
obj.data.viewer.allowImages = true;
obj.data.viewer.removeInviteLimit = true;

obj.data.viewer.showPoeDebugPanel = true;
obj.data.viewer.availableBots[1].messageLimit.shouldShowSubscriptionRationale = false;
obj.data.viewer.availableBots[1].messageLimit.dailyLimit = null;
obj.data.viewer.availableBots[1].messageLimit.numMessagesRemaining = null;
obj.data.viewer.availableBots[1].messageLimit.dailyBalance = null;
obj.data.viewer.availableBots[1].messageLimit.monthlyBalance = null;
obj.data.viewer.availableBots[1].messageLimit.shouldShowRemainingMessageCount = false;


obj.data.viewer.availableBots[2].messageLimit.shouldShowSubscriptionRationale = false;
obj.data.viewer.availableBots[2].messageLimit.dailyLimit = null;
obj.data.viewer.availableBots[2].messageLimit.numMessagesRemaining = null;
obj.data.viewer.availableBots[2].messageLimit.dailyBalance = null;
obj.data.viewer.availableBots[2].messageLimit.monthlyBalance = null;
obj.data.viewer.availableBots[2].messageLimit.shouldShowRemainingMessageCount = false;


$done({body: JSON.stringify(obj)});
