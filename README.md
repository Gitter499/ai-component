# AI Component

Dynamically render React components using LLMs

## Currently a WIP 🚧

AI Component utilizes React Server Components, which are experimental. They currently work in Next 13 with `app` directory.

## Example

```JSX
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
```

## TODO

- [x] Write intial code
- [x] Write example
- [ ] Test on Next 13
- [ ] Test on Vite (once support for RSC comes out)
- [ ] Community prompts
- [ ] Optimize
