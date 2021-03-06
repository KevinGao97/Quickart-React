import React from 'react';
import { Route, Switch, BrowserRouter } from 'react-router-dom';
import './App.css';
import WelcomePage from './react-components/WelcomePage';
import AboutPage from './react-components/AboutPage';
import LoginPage from './react-components/LoginPage';
import RegisterPage from './react-components/RegisterPage';
import NavigationBar from './react-components/NavigationBar';
import DetailedPost from './react-components/PostDetailPage';
import PostsPage from './react-components/PostsPage';
import ProfilesPage from './react-components/ProfilesPage';
import EditProfilePage from './react-components/EditProfilePage';
import EditProfileAfterRegistrationPage from './react-components/EditProfileAfterRegistrationPage';
import UserReportsPage from './react-components/UserReportsPage';
import MessagesPage from './react-components/MessagesPage';
import LoadingPage from './react-components/LoadingPage';

import { Provider } from 'react-redux';
import store from './store';
import Alert from './react-components/Alert';

class App extends React.Component {
  render() {
    return (
      <div className='App'>
        {/*To make a global state, we wrap the entire app within a redux provider*/}
        <Provider store={store}>
          <BrowserRouter>
            {/* Place the NavigationBar outside the Switch so its always present */}
            <NavigationBar />
            {/* Place the Alert outside the Switch so its always accessible */}

            {/* Route placed outside the switch make it the default page upon startup */}
            <Route
              exact
              path='/'
              render={() => <WelcomePage appState={this.state} />}
            />
            <Route
              exact
              path='/about'
              render={() => <AboutPage appState={this.state} />}
            />

            <Switch>
              <Route
                exact
                path='/register'
                render={() => <RegisterPage appState={this.state} />}
              />
              <Route
                exact
                path='/login'
                render={() => <LoginPage appState={this.state} />}
              />
              <Route
                exact
                path='/posts'
                render={() => <PostsPage appState={this.state} />}
              />
              <Route
                exact
                path='/profile'
                render={() => <ProfilesPage appState={this.state} />}
              />
              <Route
                exact
                path='/editProfile'
                render={() => <EditProfilePage appState={this.state} />}
              />
              <Route
                exact
                path='/editProfileAfterRegistration'
                render={() => (
                  <EditProfileAfterRegistrationPage appState={this.state} />
                )}
              />
              <Route
                exact
                path='/DetailPosting/:id'
                render={() => <DetailedPost appState={this.state} />}
              />

              <Route
                exact
                path='/userReports'
                render={() => <UserReportsPage appState={this.state} />}
              />
              <Route
                exact
                path='/messages'
                render={() => <MessagesPage appState={this.state} />}
              />
              <Route
                exact
                path='/loading'
                render={() => <LoadingPage appState={this.state} />}
              />

              {/* <Route exact path='/feed' render={() => 
                                (<FeedPage appState={this.state}/>)}/> */}
            </Switch>
          </BrowserRouter>
        </Provider>
      </div>
    );
  }
}

export default App;
