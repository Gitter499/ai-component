import * as React from 'react';
import * as ReactDOM from 'react-dom';
import AiComponent from '../../src/index';

import SomeComponent from './SomeComponent';

const App = () => {
  const config = {
    apiKey: process.env.OPENAI_API_KEY!!,
    name: 'Name List',
    description:
      'A list of names and their descriptions in a white rounded card',
    userData: [
      {
        name: 'John Doe',
        description: 'A person',
      },
      {
        name: 'Jane Doe',
        description: 'A person',
      },
    ],
    bindings: {
      onClick: () => {
        console.log("I'm clicked");
      },
    },
    localContextPath: './src/index.tsx',
    // Provide a path for the styles which define how your component will look like
    stylingContextPath: './src/styles/styles.css',
    components: {
      SomeComponent,
    },
  };
  
  return (
    <div>
      {/* @ts-expect-error Server Component */}
      <AiComponent
        config={config}
        loader={
          <div>
            <h1>Loading...</h1>
          </div>
        }
      />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
