const express = require('express');
const ejs = require('ejs');
const paypal = require('paypal-rest-sdk');
const port = process.env.PORT || 3000;
const app = express();

//my account
let myAc = {
  'mode': 'sandbox', //sandbox or live
  'client_id': '<YOUR CLIENT ID>',
  'client_secret': '<YOUR CLIENT SECRET>'
};
paypal.configure(myAc);

app.set('view engine', 'ejs');
app.get('/', (req, res)=>{
  res.render('index');
});
app.post('/pay', (req, res)=>{
  const create_payment_json = {
    "intent": "sale",
    "payer": {
        "payment_method": "paypal"
    },
    "redirect_urls": {
        "return_url": "http://127.0.0.1:3000/success",
        "cancel_url": "http://127.0.0.1:3000/cancel"
    },
    "transactions": [{
        "item_list": {
            "items": [{
                "name": "some shit",
                "sku": "shit",
                "price": "485",
                "currency": "USD",
                "quantity": 1
            }]
        },
        "amount": {
            "currency": "USD",
            "total": "485"
        },
        "description": "do u wanna pay some shit that's the right place"
    }]
  };
  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
        throw error;
    } else {
        console.log("Create Payment Response");
        console.log(payment);
        payment.links.forEach((link)=>{
          if(link.rel === 'approval_url')
          res.redirect(link.href)
        })
    }
  });
});
app.get('/success', (req, res)=>{
  let payerId = req.query.PayerID;
  let paymentId = req.query.paymentId;

  const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
      "amount": {
        "currency": "USD",
        "total": "485"
      }
    }]
  };
  paypal.payment.execute(paymentId, execute_payment_json, (err, payment)=>{
    if(err) {
      console.log(err.response);
      throw err;
    } else {
      console.log(JSON.stringify(payment));
      res.send('success');
    }
  });
});

app.get('/cancel', (req, res)=>{
  res.send('cancelled');
})

app.listen(port, ()=>{
  console.log(`app run on port: ${port}`);
});
