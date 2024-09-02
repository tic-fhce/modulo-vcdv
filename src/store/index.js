
// import { createStore } from 'vuex';

// const store = createStore({
//   state() {
//     return {
//       data: null
//     };
//   },
//   mutations: {
//     setData(state, payload) {
//       state.data = payload;
//     }
//   },
//   actions: {
//     setData({ commit }, payload) {
//       commit('setData', payload);
//     }
//   },
//   getters: {
//     getData: (state) => state.data
//   }
// });

// export default store;


//** PARA QUE SE ALMACENE EN EL LOCALSTORAGE */

import { createStore } from 'vuex';

const store = createStore({
  state() {
    return {
      data: JSON.parse(localStorage.getItem('data')) || null
    };
  },
  mutations: {
    setData(state, payload) {
      state.data = payload;
      localStorage.setItem('data', JSON.stringify(payload));
    }
  },
  actions: {
    setData({ commit }, payload) {
      commit('setData', payload);
    }
  },
  getters: {
    getData: (state) => state.data
  }
});

export default store;
