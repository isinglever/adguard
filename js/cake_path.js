let obj = JSON.parse($response.body);

delete obj.extra.timeSaleProduct;

for (i in obj.data) {
    for (j in obj.data[i].steps) {
        if (obj.data[i].steps[j].type == "AD") {
            delete  obj.data[i].steps[j];
        }
    }
}

$done({body: JSON.stringify(obj)});
