
import React, { Component } from 'react';
import { View, FlatList, InteractionManager } from 'react-native';
import PropTypes from 'prop-types';

const pageInit = 1;

export default class SmartListView extends Component {
  static propTypes = {
    renderItem: PropTypes.func.isRequired,
    onRefresh: PropTypes.func.isRequired,
    pageSize: PropTypes.number,
    pagination: PropTypes.bool,
    emptyView: PropTypes.func,
    numColumns: PropTypes.number,
    columnWrapperStyle: PropTypes.object,
    ListHeaderComponent: PropTypes.func,
    originData: PropTypes.array,
    style: PropTypes.object,
    keyExtractor: PropTypes.func,
  };

  constructor(props) {
    super(props);

    this._fetch = this._fetch.bind(this);
    this.state = {
      dataSource: this.props.originData || [], // 如果dataSource有数据，则第一次进入页面时不请求数据
      page: 1,
      pageSize: this.props.pageSize || 10,
      totalPage: 100,
      refreshing: false,
      noneData: false,
      pagination: this.props.pagination || false,
      requestValid: false, // 目前组件会自动触发onEndReached，需优化，暂时这样处理
    };
  }


  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      if (!this.props.originData || this.props.originData.length === 0) {
        this._fetch(this.state.page);
      }
      let timer = setTimeout(() => {
        this.state.requestValid = true;
        clearTimeout(timer);
      }, 1000);
    });
  }

  componentWillReceiveProps(nextProps) {
    // 此处需判断对象是否相同
    if (nextProps.originData) {
      this.setState({ dataSource: nextProps.originData });
    }
  }

  _successCallback(page, data = [], totalPage) {
    if (totalPage === undefined && this.state.pagination) {
      alert('为了避免无效请求，请在回调时传回总页数，如callback([], 10)');
    }

    if (this.state.noneData === true) {
      this.state.dataSource = [];
    }

    let tempData = (page === 1 ? data : [...this.state.dataSource, ...data]);

    this.setState({
      dataSource: tempData.length === 0 ? ['showEmptyView'] : tempData,
      totalPage: totalPage === 0 ? 0 : totalPage,
      noneData: tempData.length === 0,
      page,
    });
  }

  _fetch(page) {
    if (page > this.state.totalPage) {
      return;
    }

    this.props.onRefresh(page, this.state.pageSize, (...args) => this._successCallback(page, ...args));
  }

  refresh() {
    this.state.totalPage = 100;
    this._fetch(pageInit);
  }

  render() {
    return (
      <FlatList
        style={this.props.style}
        data={this.state.dataSource}
        renderItem={this.state.noneData ? () => {
          return (
            <View>
              {this.props.emptyView ? this.props.emptyView() : <View />}
            </View>
          );
        } : this.props.renderItem}
        ListHeaderComponent={this.props.ListHeaderComponent}
        numColumns={this.props.numColumns || 1}
        onRefresh={this._fetch.bind(this, pageInit)}
        refreshing={this.state.refreshing}
        onEndReachedThreshold={0.05}
        onEndReached={this.state.pagination === true ? () => {
          if (this.state.requestValid === false) {
            return;
          }
          this._fetch(this.state.page + 1);
        } : () => { }}
        keyExtractor={this.props.keyExtractor ? this.props.keyExtractor : (item, index) => `${index}`}
        removeClippedSubviews={false}
      />
    );
  }
}
