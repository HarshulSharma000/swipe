import React, { Component } from 'react';
import { View, Animated, PanResponder, Dimensions, UIManager, LayoutAnimation } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 300;

class Deck extends Component {
    static defaultProps = {
      onSwipeRight: () => {},
      onSwipeLeft: () => {},
    }

    constructor(props) {
      super(props);
      this.state = { index: 0 };
      this.position = new Animated.ValueXY();
      this.panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (event, gesture) => {
         this.position.setValue({ x: gesture.dx });
        },
        onPanResponderRelease: (event, gesture) => {
          if (gesture.dx > SWIPE_THRESHOLD) {
            this.forceSwipe('right');
          } else if (gesture.dx < -SWIPE_THRESHOLD) {
            this.forceSwipe('left');
          } else {
            this.resetCard();
          }
        }
      });
    }
    componentWillReceiveProps(nextProps) {
      if (nextProps.data !== this.props.data) {
        this.setState({ index: 0 });
      }
    }
    componentWillUpdate() {
      const nothing = UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
      LayoutAnimation.spring();
    }
     onSwipeComplete(direction) {
      const { onSwipeLeft, onSwipeRight, data } = this.props;
      const item = data[this.state.index];
      const nothing = direction === 'right' ? onSwipeRight(item) : onSwipeLeft(item); 
      this.position.setValue({ x: 0, y: 0 });
      this.setState({ index: this.state.index + 1 });
    }

    getCardValue() {
      const rotate = this.position.x.interpolate({
        inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
        outputRange: ['-90deg', '0deg', '90deg']
      });
      
      return ({
        transform: [{ rotate }]
      });
    }
    forceSwipe(direction) {
      let x = 0;
      if (direction === 'right') {
        x = SCREEN_WIDTH;
      } else if (direction === 'left') {
        x = -SCREEN_WIDTH;
      } else {
        console.log('Sorry Wrong Input in forceswipe(){"left","right"})');
        x = 0;
      }
      Animated.timing(this.position, {
        toValue: { x, y: 0 },
        duration: SWIPE_OUT_DURATION
      }).start(() => { this.onSwipeComplete(direction); });
     //this.onSwipeComplete(direction);
    }

    resetCard() {
      Animated.spring(this.position, {
            toValue: { x: 0, y: 0 }
          }).start();
    }
    renderCards() {
      if (this.state.index >= this.props.data.length) {
        return this.props.renderNoMoreCards();
      }

      return this.props.data.map((item, i) => {
        if (i < this.state.index) { return null; }

        if (i === this.state.index) {
          return (
            <Animated.View 
            {...this.panResponder.panHandlers}
            style={[styles.cardStyle, this.position.getLayout(), { zIndex: 99 }, this.getCardValue()]}
            key={item.id}
            >
              {this.props.renderCard(item)}
            </Animated.View>
          ); 
        } 
          return (
            <Animated.View
            style={[styles.cardStyle, { zIndex: 5, top: 10 * (i - this.state.index) }]}
            key={item.id}
            >
              {this.props.renderCard(item)}
            </Animated.View>
          );   
      }).reverse();
    }
    render() {
        return (
          <View >
            {this.renderCards()}
          </View>
        );
    }
}

const styles = {
  cardStyle: {
    position: 'absolute',
    width: SCREEN_WIDTH
  }
};

export default Deck;
