import { createChannel } from '@storybook/channel-websocket';
import * as vscode from 'vscode';
import * as WebSocket from 'ws';

let storybookSocket: WebSocket;
let storybookChannel;

export function activate(context: vscode.ExtensionContext) {
  console.log('Started vscode-react-native-storybook');

  // FIXME: Change configuration
  const host = 'localhost';
  // vscode.workspace
  //   .getConfiguration('react-native-storybooks')
  //   .get('host');
  const port = 7007;
  // vscode.workspace
  //   .getConfiguration('react-native-storybooks')
  //   .get('port');

  const reactNativeUri = `ws://${host}:${port}`;

  start();

  async function start() {
    try {
      storybookChannel = createChannel({
        url: `ws://${host}:${port}`,
        async: true,
        onError: () => {},
      });
      storybookSocket = await connect();
    } catch (error: unknown) {
      throw new Error('Failed connecting to storybook server.');
    }

    storybookSocket.send(JSON.stringify({ type: 'Hello', args: {} }));
  }

  function connect(): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
      console.log(`Connecting to ${reactNativeUri}`);

      const ws = new WebSocket(reactNativeUri, {
        perMessageDeflate: false,
      });

      const timeout = setTimeout(() => {
        // FIXME:
        // const error = new Error('Timed out connecting to storybook web socket');
        // reject(error);
      }, 10000);

      const onOpen = () => {
        console.log('Connected');
        clearTimeout(timeout);
        resolve(ws);
        ws.on('message', onMessage);
      };

      const onClose = () => {
        console.log('Connection closed');
        clearTimeout(timeout);
      };

      const onError = (error: unknown) => {
        console.log('Connection failed', error);
        clearTimeout(timeout);
        reject(error);
        // messageQueue.rejectAll(err);
      };

      const onMessage = (data: any) => {
        const { type, args } = JSON.parse(data);
        console.log(
          `Received message ${type} with args ${JSON.stringify(args, null, 2)}`,
        );
        // messageQueue.receiveMessage(type, args);
      };

      ws.on('open', onOpen);
      ws.on('close', onClose);
      ws.on('error', onError);
    });
  }

  const registerCallbacks = () => {
    // channel.on('setStories', data => {
    //   const filter = vscode.workspace
    //     .getConfiguration('react-native-storybooks')
    //     .get('storybookFilterRegex') as string;
    //   const regex = new RegExp(filter);
    //   let stories: Story[] = [];
    //   if (Array.isArray(data.stories)) {
    //     let kinds: { [key: string]: StoryObj[] } = {};
    //     const storydata = data.stories.filter(s => s.kind.match(regex));
    //     storydata.map(story => {
    //       story.stories.map(singleStory => {
    //         if (kinds[story.kind] == undefined) {
    //           // kinds[story.kind] = [story.name]
    //           kinds[story.kind] = [{ name: singleStory, id: singleStory }];
    //         } else {
    //           kinds[story.kind].push({ name: singleStory, id: singleStory });
    //         }
    //       });
    //     });
    //     Object.keys(kinds).forEach(function (key) {
    //       stories.push({
    //         kind: key,
    //         stories: kinds[key],
    //       });
    //     });
    //   } else {
    //     let kinds: { [key: string]: StoryObj[] } = {};
    //     Object.keys(data.stories).forEach(function (key) {
    //       const story = data.stories[key];
    //       if (story.kind.match(regex)) {
    //         if (kinds[story.kind] == undefined) {
    //           // kinds[story.kind] = [story.name]
    //           kinds[story.kind] = [{ name: story.name, id: story.id }];
    //         } else {
    //           kinds[story.kind].push({ name: story.name, id: story.id });
    //         }
    //       }
    //     });
    //     Object.keys(kinds).forEach(function (key) {
    //       stories.push({
    //         kind: key,
    //         stories: kinds[key],
    //       });
    //     });
    //   }
    //   storiesProvider.stories = stories;
    //   storiesProvider.refresh();
    //   reconnectStatusBarItem.hide();
    // });
    // When the server in RN starts up, it asks what should be default
    // channel.on('getCurrentStory', () => {
    //   storybooksChannel.emit('setCurrentStory', {
    //     storyId: currentStoryId,
    //   });
    // });
    // The React Native server has closed
    // channel.transport.socket.onclose = () => {
    //   storiesProvider.stories = [];
    //   storiesProvider.refresh();
    //   reconnectStatusBarItem.show();
    // };
    // channel.emit('getStories');
  };

  let connectStorybook = vscode.commands.registerCommand(
    'vscode-react-native-storybook.connectStorybook',
    () => registerCallbacks(),
  );

  context.subscriptions.push(connectStorybook);
}

export function deactivate() {}
