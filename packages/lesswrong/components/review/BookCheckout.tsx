import React, { useState, useEffect } from "react";
// import { loadStripe } from "@stripe/stripe-js";
import { registerComponent } from "../../lib/vulcan-lib";
// import { DatabasePublicSetting } from "../../lib/publicSettings";
import { useTracking } from "../../lib/analyticsEvents";
import classNames from 'classnames';

// const stripePublicKeySetting = new DatabasePublicSetting<null|string>('stripe.publicKey', null)

const styles = (theme: ThemeType): JssStyles => ({
  root: {
    ...theme.typography.commentStyle,
    
    [theme.breakpoints.down('xs')]: {
      maxWidth: 200,
    },
  },
  checkoutButton: {
    ...theme.typography.commentStyle,
    height: '36px',
    background: "#53a55a", //theme.palette.primary.dark,
    paddingLeft: 16,
    paddingRight: 16,
    color: 'white',
    fontSize: '14px',
    border: 0,
    fontWeight: '500',
    cursor: 'pointer',
    letterSpacing: '0.6',
    borderRadius: '6px',
    transition: 'all 0.2s ease',
    boxShadow: '0px 4px 5.5px 0px rgba(0, 0, 0, 0.07)',
    '&:hover': {
      opacity: 0.8
    },
    
    [theme.breakpoints.down('xs')]: {
      width: 175,
    },
  },
  buyUsButton: {
    minWidth: 140,
    marginBottom: 8,
  },
  intlButton: {
    background: "white",
    marginLeft: 10,
    color: "#606060",
    border: "1px solid #ccc",
    
    [theme.breakpoints.down('xs')]: {
      marginLeft: 0,
    },
  },
})

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
// const stripePublicKey = stripePublicKeySetting.get()
// const stripePromise = stripePublicKey && loadStripe(stripePublicKey);
const amazonLink = "https://www.amazon.com/Map-that-Reflects-Territory-LessWrong/dp/1736128507"

const ProductDisplay = ({ handleClickAmazon, text="Buy", classes }: {
  handleClickAmazon: (event: any)=>void,
  // handleClickStripe: (event: any)=>void,
  text?: string,
  classes: ClassesType,
}) => {
  return <>
    <button className={classNames(classes.checkoutButton, classes.buyUsButton)} id="checkout-button-amazon-us" role="link" onClick={handleClickAmazon}>
      {`${text} (US) - $29`}
    </button>
    {/* <button className={classNames(classes.checkoutButton, classes.intlButton)} id="checkout-button" role="link" onClick={handleClickStripe}>
      {`${text} (international) - $29`}
    </button> */}
  </>
};
const Message = ({ message, classes }: {message: string, classes: ClassesType}) => (
  <section>
    <p className={classes.messageParagraph}>{message}</p>
  </section>
);
export default function BookCheckout({classes, ignoreMessages = false, text}: {classes: ClassesType, ignoreMessages?: boolean, text?: string}) {
  const [message, setMessage] = useState("");
  const { captureEvent } = useTracking()
  
  useEffect(() => {
    // Check to see if this is a redirect back from Checkout
    const query = new URLSearchParams(window.location.search);
    if (query.get("success")) {
      setMessage("Order placed! You will receive an email confirmation.");
    }
  }, []);
  const handleClickAmazon = async (event: Event) => {
    captureEvent("preOrderButtonClicked")
    window.location.assign(amazonLink);
  }
  // const handleClickStripe = async (event: Event) => {
  //   captureEvent("preOrderButtonClicked")
  //   const stripe = await stripePromise;
  //   if (stripe) {
  //     const response = await fetch("/create-session", {
  //       method: "POST",
  //     });
  //     const session = await response.json();
  //     // When the customer clicks on the button, redirect them to Checkout.
  //     const result = await stripe.redirectToCheckout({
  //       sessionId: session.id,
  //     });
  //     if (result.error) {
  //       // If `redirectToCheckout` fails due to a browser or network
  //       // error, display the localized error message to your customer
  //       // using `result.error.message`.
  //     }
  //   }
  // };

  return <div className={classes.root}>
    { (message && !ignoreMessages) ? (
      <Message message={message} classes={classes} />
    ) : (
      <ProductDisplay handleClickAmazon={handleClickAmazon} text={text} classes={classes}/>
    ) }
  </div>
}

const BookCheckoutComponent = registerComponent('BookCheckout', BookCheckout, {styles});

declare global {
  interface ComponentTypes {
    BookCheckout: typeof BookCheckoutComponent
  }
}
