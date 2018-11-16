import React , { Component } from 'react'
import { Button, Checkbox, Form } from 'semantic-ui-react'
import Layout from '../../components/Layout';
import {IdentityFactory} from '../../ethereum/identityFactory';
import { Link, Router } from '../../routes';
class Register extends Component {

   state = {
    userName:'',
    firstName:'',
    lastName:'',
    email:'',
    phone:'',
    password:'',
    errorMessage: '',
    loading: false
  };

  onSubmit = async event => {
    event.preventDefault();
    try {
      this.setState({ loading: true, errorMessage: '' });

        const  PROFILE = {
          "documentId": {
              "additionalType": "DNI",
              "identifier": this.state.userName,
              "issuedBy": "PE"
          },
          "email": this.state.email,
          "name": {
              "familyName": [
                  this.state.firstName,
              ],
              "givenName": [
                  this.state.lastName
              ]
          },
          "telephone": this.state.phone
        };
        const user = this.state.userName;
        const keyPhrase = user + ':' + this.state.password + ':';
        console.log(user);
        console.log(keyPhrase);
        console.log(PROFILE);
        
        
        const addressIdentityManager='0x54bbe069cf9583792b80041363c4f8078a975e70'
        console.log(IdentityFactory);
        const  did =  await IdentityFactory.createIdentityPersonIdentityManager(PROFILE, user, keyPhrase,addressIdentityManager);
        console.log("await");
        console.log(did);
        Router.pushRoute(`/`);
      } catch (err) {
        this.setState({ errorMessage: err.message });
      }

    this.setState({ loading: false });
  };

  render() {
    return (
   <Layout>
    <Form onSubmit={this.onSubmit}>
      <Form.Field>
        <label>User Name</label>
        <input placeholder='User Name' 
        value={this.state.userName}
              onChange={event =>
                this.setState({ userName: event.target.value })} />
      </Form.Field>
      <Form.Field>
        <label>First Name</label>
        <input placeholder='First Name'   value={this.state.firstName}
              onChange={event =>
                this.setState({ firstName: event.target.value })} />
      </Form.Field>
      <Form.Field>
        <label>Last Name</label>
        <input placeholder='Last Name' value={this.state.lastName}
              onChange={event =>
                this.setState({ lastName: event.target.value })}/>
      </Form.Field>
      <Form.Field>
        <label>Email</label>
        <input placeholder='Email' value={this.state.email}
              onChange={event =>
                this.setState({ email: event.target.value })} />
      </Form.Field>
      <Form.Field>
        <label>Phone number</label>
        <input  placeholder='Phone number' placeholder='phone number' value={this.state.phone}
              onChange={event =>
                this.setState({ phone: event.target.value })} />
      </Form.Field>
      <Form.Field>
        <label>Password</label>
        <input type='password' placeholder='Password' value={this.state.password}
              onChange={event =>
                this.setState({ password: event.target.value })}/>
      </Form.Field>
      
      <Button loading={this.state.loading} primary>Create account</Button>
    </Form>
  </Layout>
  )
  }
}


export default Register