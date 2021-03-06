import React, { Component } from 'react';
import { Form, Button, Message, Input } from 'semantic-ui-react';
import Crowdfund from '../../../ethereum/crowdfund';
import web3 from '../../../ethereum/web3';
import { Link, Router } from '../../../routes';
import Layout from '../../../components/Layout';

class ExpenditureNew extends Component {
  state = {
    amount: '',
    description: '',
    recipient: '',
    loading: false,
    errorMessage: ''
  };

  static async getInitialProps(props) {
    const { address } = props.query;

    return { address };
  }

  onSubmit = async event => {
    event.preventDefault();

    const crowdfund = Crowdfund(this.props.address);
    const { description, amount, recipient } = this.state;

    this.setState({ loading: true, errorMessage: '' });

    try {
      const accounts = await web3.eth.getAccounts();
      await crowdfund.methods
        .requestExpenditure(description, web3.utils.toWei(amount, 'ether'), recipient)
        .send({ from: accounts[0] });

      Router.pushRoute(`/crowdfunds/${this.props.address}/expenditures`);
    } catch (err) {
      this.setState({ errorMessage: err.message });
    }

    this.setState({ loading: false });
  };

  render() {
    return (
      <Layout>
        <Link route={`/crowdfunds/${this.props.address}/expenditures`}>
          <a>Back</a>
        </Link>
        <h3>Create a Expenditure</h3>
        <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage}>
          <Form.Field>
            <label>Description</label>
            <Input
              amount={this.state.description}
              onChange={event =>
                this.setState({ description: event.target.value })}
            />
          </Form.Field>

          <Form.Field>
            <label>amount in Ether</label>
            <Input
              amount={this.state.amount}
              onChange={event => this.setState({ amount: event.target.value })}
            />
          </Form.Field>

          <Form.Field>
            <label>Recipient</label>
            <Input
              amount={this.state.recipient}
              onChange={event =>
                this.setState({ recipient: event.target.value })}
            />
          </Form.Field>

          <Message error header="Oops!" content={this.state.errorMessage} />
          <Button primary loading={this.state.loading}>
            Create!
          </Button>
        </Form>
      </Layout>
    );
  }
}

export default ExpenditureNew;
