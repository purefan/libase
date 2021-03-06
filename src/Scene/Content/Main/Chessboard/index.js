require('./board.css')
require('./images/pieces/stauton.css')
require('./index.scss')

const Chessboard = {
    set_up_board: function (vnode) {
        const chessboard    = require('chessground').Chessground
        const chessjs       = require('chess.js')
        vnode.state.chessjs = new chessjs()
        function toDests() {
            const dests = {};
            vnode.state.chessjs.SQUARES.forEach(s => {
                const ms = vnode.state.chessjs.moves({ square: s, verbose: true });
                if (ms.length) {
                    dests[s] = ms.map(m => m.to)
                }
            });
            return dests;
        }
        const config = {
            orientation: 'white',
            coordinates: false,
            autoCastle: false,
            addPieceZIndex: false,
            turnColor: 'white',
            movable: {
                free: true,
                color: 'both',
                dropOff: 'trash',
                events: {
                    after: (orig, dest, meta) => {
                        const valid_move = vnode.state.chessjs.move({ from: orig, to: dest })
                        if (!valid_move) {
                            this.ground.set({ fen: vnode.state.chessjs.fen() })
                        } else {
                            valid_move.fen = vnode.state.chessjs.fen()
                            vnode.attrs.eventer.emit('libase.board.changed', valid_move)
                            vnode.attrs.fen = valid_move.fen
                        }
                    }
                }
            },
            animation: {
                duration: 1000
            },
            premovable: {
                enabled: false
            },
            drawable: {
                enabled: true
            },
            draggable: {
                showGhost: true,
                distance: 0,
                autoDistance: false,
                deleteOnDropOff: true
            },
            selectable: {
                enabled: false
            },
            highlight: {
                lastMove: false
            }
        }
        if (vnode.attrs.fen) {
            config.fen = vnode.attrs.fen
            const loaded_succ = vnode.state.chessjs.load(vnode.attrs.fen)
        }

        const board_container = document.getElementById('board_container')
        this.ground = chessboard(board_container, config)
        vnode.attrs.chessboard = {
            getFen : vnode.state.chessjs.fen,
            getMoves: vnode.state.chessjs.history
        }
        vnode.attrs.eventer.emit('libase.board.ready')
    },
    resize_board: (vnode) => {
        // Needs to be scheduled
        setTimeout(() => {
            const boards = document.getElementsByClassName('cg-board-wrap')
            Object.keys(boards).forEach((board) => {
                const this_board = boards[board]
                const container_dimensions = document.getElementsByClassName('content')[0].getBoundingClientRect()
                // which one is smaller (it has to be a square)
                const new_length = Math.min(container_dimensions.width, container_dimensions.height)
                const factor = 0.8
                boards[board].style.width = (new_length * factor) + 'px'
                boards[board].style.height = (new_length * factor) + 'px'

                document.getElementsByClassName('main_left')[0].style.width = ((new_length * factor) + 50) + 'px'
            })
            document.body.dispatchEvent(new Event('chessground.resize'))
        })
    },
    view: (vnode) => {
        const self = this
        const board_container = vnode.attrs.m('div', {
            id: 'board_container',
            oncreate: () => {
                if (document.getElementsByClassName('cg-board').length < 1) {
                    vnode.state.set_up_board(vnode)
                }
                vnode.state.resize_board(vnode)
            },
            onupdate: () => {
                vnode.state.resize_board(vnode)
            }
        })
        return board_container
    }
}

module.exports = Chessboard