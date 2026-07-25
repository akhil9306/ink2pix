import React from "react";
import { Route, Switch } from "wouter";
import { Home } from "./Home";
import { Studio } from "./Studio";

export default function App() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/app" component={Studio} />
      <Route component={Studio} />
    </Switch>
  );
}
