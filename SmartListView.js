/**
 * Author: edward
 *
 * Content: 封装FlatList，开发者无需处理dataSource、page，也无需主动发起请求
 */
import React, { Component } from 'react';
import { FlatList, InteractionManager, RefreshControl } from 'react-native';
import PropTypes from 'prop-types';

const pageInit = 1;
const defaultPageSize = 10;
const maxTotalPage = 1000;

export default class SmartListView extends Component {
  static propTypes = {
    style: PropTypes.object,
    originData: PropTypes.array,
    renderItem: PropTypes.func.isRequired,
    onRefresh: PropTypes.func.isRequired,
    pagination: PropTypes.bool,
    pageSize: PropTypes.number,
    indicatorColor: PropTypes.string,
    emptyView: PropTypes.func,
    ListHeaderComponent: PropTypes.func,
    ListFooterComponent: PropTypes.func,
  };

  static defaultProps = {
    style: {},
    originData: [],
    renderItem: () => null,
    onRefresh: () => { },
    pagination: false,
    pageSize: defaultPageSize,
    indicatorColor: '#292349',
    emptyView: () => null,
    ListHeaderComponent: () => null,
    ListFooterComponent: () => null,
  }

  constructor(props) {
    super(props);

    this._fetch = this._fetch.bind(this);
    this.state = {
      dataSource: this.props.originData || [], // 如果dataSource有数据，则第一次进入页面时不请求数据
      page: 1,
      pageSize: this.props.pageSize,
      totalPage: maxTotalPage,
      pagination: this.props.pagination || false,
      refreshing: false,
      endReachValid: false, // onEndReached的bug，有时候会触发两次，解决方案为：在滚动的时候不刷新，滚动停止时刷新
    };
  }


  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      // 如果没有传入数据源，则主动发起请求
      if (!this.props.originData || this.props.originData.length === 0) {
        this._fetch(this.state.page);
      }
    });
  }

  // 成功的回调
  _successCallback(page, data = [], totalPage) {
    if (totalPage === undefined && this.state.pagination) {
      alert('为了避免无效请求，请在回调时传回总页数，如callback([], 10)');
    }

    this.setState({
      dataSource: (page === 1 ? data : [...this.state.dataSource, ...data]),
      totalPage,
      page,
      refreshing: false,
    });
  }

  // 请求失败
  _failCallback() {
    this.setState({
      refreshing: false,
    });
  }

  _fetch(page, forRefresh = false) {
    // 如果不是刷新，且已到最后一页，则不发请求
    if (!forRefresh && page > this.state.totalPage) {
      return;
    }

    this.setState({ refreshing: true });
    this.props.onRefresh(
      page,
      this.state.pageSize,
      (...args) => this._successCallback(page, ...args),
      () => this._failCallback(),
    );
  }

  // 给业务模块提供刷新接口
  refresh() {
    this._fetch(pageInit, true);
  }

  // 给业务模块提供更新数据源接口
  updateDataSource(dataSource = [], totalPage = 0, page = pageInit, pageSize = defaultPageSize) {
    this.setState({
      dataSource,
      totalPage,
      page,
      pageSize,
    });
  }

  render() {
    return (
      <FlatList
        keyExtractor={(item, index) => `${item}_${index}`}
        style={this.props.style}
        data={this.state.dataSource}
        renderItem={(...args) => this.props.renderItem(...args)}
        onRefresh={() => this.refresh()}
        refreshing={this.state.refreshing}
        onEndReachedThreshold={0.5}
        onEndReached={() => {
          if (this.state.endReachValid) {
            this._fetch(this.state.page + 1);
          }
        }}
        onScrollBeginDrag={() => {
          this.state.endReachValid = false;
        }}
        onScrollEndDrag={() => {
          this.state.endReachValid = true;
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            colors={[this.props.indicatorColor]}
            tintColor={this.props.indicatorColor}
            refreshing={this.state.refreshing}
            onRefresh={() => this.refresh()}
          />
        }
        ListEmptyComponent={this.props.emptyView}
        ListHeaderComponent={this.props.ListHeaderComponent}
        ListFooterComponent={this.props.ListFooterComponent}
      />
    );
  }
}
