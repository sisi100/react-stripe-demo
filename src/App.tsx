import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import {Elements} from '@stripe/react-stripe-js';
import {loadStripe} from '@stripe/stripe-js';
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { useState } from "react";
import * as stripeJs from "@stripe/stripe-js";


function App() {
  return (
    <Router>
      <Switch>
        <Route path="/set-card">
          <SetCard />
        </Route>
        <Route path="/thanks">
          <Thanks />
        </Route>
        <Route path="/">
          <Hello />
        </Route>
      </Switch>
    </Router>
  );
}

function Hello() {
  const [publicKey, setPublicKey] = useState<string>("");
  const handleChange = (e: any) => {
    setPublicKey(e.target.value);
  };
  const setClick = () => {
    localStorage.setItem("publicKey", publicKey);
  };

  return (
    <div>
      <h1>カード登録するデモ</h1>
      <Link to="/set-card">カード登録</Link>
      <p>パブリックキーの登録:
      <input type="text" onChange={handleChange} />
      <button onClick={setClick}>ローカルストレージへ保存</button>
      </p>
    </div>
  );
}

// 完了ページ
function Thanks() {
  return (
    <div>
      <h1>登録完了</h1>
      <Link to="/">ホームへ</Link>
    </div>
  );
}

// カード登録
function SetCard() {
  const stripePromise = loadStripe(`${localStorage.getItem("publicKey")}`);
  const [isSet, setIsSet]=useState<boolean>(false);

  const [clientSecret, setClientSecret] =
    useState<stripeJs.StripeElementsOptions>({
      clientSecret:
        "",
    });

  const handleChange = (e: any) => {
    setClientSecret({ clientSecret:e.target.value });
  };
  const setClick = () => {
    setIsSet(true);
  };

  if (!isSet) {
    return (
      <div>
        <h1>クレカ登録</h1>
        <Link to="">ホームへ</Link>
        <p>
          clientSecret:
          <input type="text" onChange={handleChange} />
          <button onClick={setClick}>次へ</button>
        </p>
        <p>※ clientSecret が違うと落ちます</p>
      </div>
    );
  }
  return (
    <div>
      <h1>クレカ登録</h1>
      <Link to="">ホームへ</Link>
      <Elements stripe={stripePromise} options={clientSecret}>
        <CheckoutForm />
      </Elements>
    </div>
  );
}

// チェックアウト
function CheckoutForm(){
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event:any) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const result = await stripe.confirmSetup({
      elements,
      confirmParams: {
        return_url: 'http://localhost:3000/thanks',
      },
    });
    if (result.error) {
      console.log(result.error.message);
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button disabled={!stripe}>Submit</button>
    </form>
  );
};

export default App;
