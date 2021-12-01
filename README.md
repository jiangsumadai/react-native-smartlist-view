
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
          renderItem={({ item }) => {
            return (
              <YourCell
                detail={item}
                {...this.props}
              />
            );
          }}
          onRefresh={(page, pageSize, successCallback, errorCallback) => yourInterface(YourParams)}
          {...this.props}
        />
    );
  }
}
```
2.开放的接口
1）刷新
```
refresh()
```
2）更新数据源
```
updateDataSource()
```

## License

MIT
