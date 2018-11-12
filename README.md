
Easy way to use flatlist.

## Install

```shell
$ npm install @edwardzhou/react-native-smartlist-view --save
```

## Usage
1.yourFile.js
```js
import React, { Component } from 'react';
import { SmartListView } from '@edwardzhou/react-native-smartlist-view';

export default class MyComponent extends Component {

  render() {
    return (
      <SmartListView
          style={{ flex: 1 }}
          pagination
          renderItem={({ item }) => {
            return (
              <YourCell
                detail={item}
                {...this.props}
              />
            );
          }}
          onRefresh={(...args) => yourInterface(YourParams, ...args)}
          {...this.props}
        />
    );
  }
}
```

## License

MIT
