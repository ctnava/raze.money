import React from "react";
import Banner from "./components/Banner";
import DesignPrinciples from "./components/DesignPrinciples";
import Products from "./components/Products";
import Services from "./components/Services";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

function Home() {
  return (
    <div>
      <Banner/>
      <DesignPrinciples/>
      <Products/>
      <Services/>
      <Contact/>
      <Footer/>
    </div>
  );
}

export default Home;
