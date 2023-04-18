import fs from 'fs';
import React, { Suspense } from 'react';

import { Document } from 'langchain/document';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { LLMChain } from 'langchain';
import { ChatOpenAI } from 'langchain/chat_models';
import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
} from 'langchain/prompts';

import JsxParser from 'react-jsx-parser';
import { prompts } from './prompts';

export type Config = {
  /*
            @description: The name of the component
        */
  name: string;
  /*
            @description: The description of the component, describes the role of the component
        */
  description: string;
  /*
            @description: User provided data to taylor the component to the user
        */
  userData: string | Record<any, any>;
  /*
            @description: The path to the project's styles
        */
  stylingContextPath?: string | string[];
  /* 
            @description: Local context path
        */
  localContextPath?: string;

  components?: Record<string, React.ComponentType | React.ExoticComponent<{}>>;
  apiKey: string;
  bindings?: { [key: string]: unknown };
  promptName?: string;
};

const getFiles = (paths: string[]): string[] => {
  const files: string[] = [];

  for (const path of paths) {
    if (fs.existsSync(path)) {
      files.push(
        fs.readFileSync(path, {
          encoding: 'utf-8',
        })
      );
    }
  }

  if (files.length == 0) throw new Error('No files found');

  return files;
};

const getContextFromFiles = async (
  path: string | string[] | undefined
): Promise<Document[]> => {
  if (!path) return [];

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 10,
    chunkOverlap: 1,
  });

  if (path instanceof Array) {
    const files = getFiles(path);
    const documents = await splitter.createDocuments(files);
    return documents;
  }

  if (!fs.existsSync(path)) throw new Error(`File not found: ${path}`);

  const file = fs.readFileSync(path, {
    encoding: 'utf-8',
  });

  const documents = await splitter.createDocuments([file]);
  return documents;
};

const generateJsx = async (
  config: Config,
  docs: Document[],
): Promise<string> => {
  const prompt = prompts.find(p =>
    p.name === config.promptName ? config.promptName : 'base'
  )?.prompt;

  const chat = new ChatOpenAI({
    temperature: 0,
    openAIApiKey: config.apiKey,
  });

  const chain = new LLMChain({
    llm: chat,

    prompt: ChatPromptTemplate.fromPromptMessages([
      SystemMessagePromptTemplate.fromTemplate(prompt ?? prompts[0].prompt),
      HumanMessagePromptTemplate.fromTemplate(
        'docs: {input_documents}, name: {name}, description: {description}, userData: {userData}, bindings: {bindings}, components: {components}'
      ),
    ]),
  });

  const response = await chain.call({
    input_documents: JSON.stringify(docs),
    name: config.name,
    description: config.description,
    userData: JSON.stringify(config.userData),
    bindings: JSON.stringify(config.bindings),
    components: JSON.stringify(config.components),
  });

  return response.text;
};

type Props = {
  config: Config;

  loader: NonNullable<React.ReactNode> | null;
};

const AiComponent = async ({ config, loader }: Props) => {
  const stylingContext = await getContextFromFiles(config.stylingContextPath);

  const localContext = await getContextFromFiles(config.localContextPath);

  const jsx = await generateJsx(
    config,
    [...stylingContext, ...localContext]
  );

  return (
    <Suspense fallback={loader}>
      \{/* @ts-ignore */}
      <JsxParser
        bindings={config.bindings}
        // @ts-ignore
        components={config.components}
        jsx={jsx}
      />
    </Suspense>
  );
};

export default AiComponent;
