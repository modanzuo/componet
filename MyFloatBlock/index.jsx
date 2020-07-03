import React, { useCallback, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import styles from './index.less';

/**
 * 靠边浮层
 * @param children   Element
 * @param position   Object
 * @param onClick    Function
 * @returns   Element
 */
function MyFloatBlock({ children, position, onClick }) {
    const touchRef = useRef(null);
    const touchData = useRef({
        winWidth: document.body.clientWidth,
        startData: {
            x: null,
            y: null,
        },
        translateData: {
            x: null,
            y: null,
        },
        moveData: {
            x: null,
            y: null,
        },
    });

    //动画显示
    const animation = ({ translateX, translateY, s = 0.1, isEnd = false }) => {
        if (touchRef.current) {
            touchRef.current.style = `transform: translate3d(${translateX}px,${translateY}px,0);  
            transition: transform ${s}s linear`;
            if (isEnd) {
                touchData.current.startData = {
                    x: null,
                    y: null,
                };
                touchData.current.moveData = {
                    x: null,
                    y: null,
                };
                touchData.current.translateData = {
                    x: translateX,
                    y: translateY,
                };
            }
        }
    };

    // PC 端mouse
    const mouseDown =  useCallback((event) => {
        event.preventDefault();
        event.stopPropagation();
        const drag = touchRef.current;
        event = event || window.event;  //兼容IE浏览器
        //    鼠标点击物体那一刻相对于物体左侧边框的距离=点击时的位置相对于浏览器最左边的距离-物体左边框相对于浏览器最左边的距离
        const y = event.clientY;
        const x = event.clientX;
        touchData.current.startData = {
            x,
            y,
        };
        touchData.current.moveData = {
            ...touchData.current.translateData,
        };
        if (typeof drag.setCapture !== 'undefined') {
            drag.setCapture();
        }
        document.onmousemove = function (evt) {
            evt = evt || window.event;
            evt.preventDefault();
            evt.stopPropagation();
            const { x: startX, y: startY } = touchData.current.startData;
            if (startY !== null) {
                const { x: moveX, y: moveY } = touchData.current.moveData;
                const moveSiteX = evt.clientX;
                const moveSiteY  = evt.clientY;
                const translateX = moveX + (moveSiteX - startX);
                const translateY = moveY + (moveSiteY - startY);
                animation({
                    translateX,
                    translateY,
                    s: 0,
                });
            }
        };
        document.onmouseup = function (evt) {
            const { x: startX, y: startY } = touchData.current.startData;
            if (startY !== null) {
                evt.preventDefault();
                evt.stopPropagation();
                const { x: moveX, y: moveY } = touchData.current.moveData;

                const endX = evt.clientX;
                const endY = evt.clientY;
                const cX = endX - startX;
                const cY = endY - startY;
                const translateSiteX = moveX + cX;
                const translateY = moveY + cY;
                const clientWidth = touchData.current.winWidth - touchRef.current.clientWidth;
                const cWidth = clientWidth / 2;
                let translateX = 0;
                if (cWidth <= Math.abs(translateSiteX)) {
                    translateX = position.left ? clientWidth : -clientWidth;
                }
                if (Math.abs(cX) <= 10 && Math.abs(cY) <= 10) {
                    onClick && onClick();
                }
                animation({
                    translateX,
                    translateY,
                    s: 0.1,
                    isEnd: true,
                });
            }
        };
    }, [onClick, position.left]);

    // touch 事件start
    const touchStartHandle = useCallback((evt) => {
        evt.preventDefault();
        evt.stopPropagation();
        console.log(evt);
        const x = evt.clientX || evt.touches[0].clientX;
        const y = evt.clientY || evt.touches[0].clientY;
        touchData.current.startData = {
            x,
            y,
        };
        touchData.current.moveData = {
            ...touchData.current.translateData,
        };
    }, []);

    // touch 事件move
    const touchMoveHandle = useCallback((evt) => {
        evt.preventDefault();
        evt.stopPropagation();
        const { x: startX, y: startY } = touchData.current.startData;
        if (startY !== null) {
            const { x: moveX, y: moveY } = touchData.current.moveData;
            const moveSiteX = evt.changedTouches[0].clientX;
            const moveSiteY  = evt.changedTouches[0].clientY;
            const translateX = moveX + (moveSiteX - startX);
            const translateY = moveY + (moveSiteY - startY);
            animation({
                translateX,
                translateY,
                s: 0,
            });
        }
    }, []);

    // touch 事件结束
    const touchEndHandle = useCallback(
        (evt) => {
            const { x: startX, y: startY } = touchData.current.startData;
            if (startY !== null) {
                evt.preventDefault();
                evt.stopPropagation();
                const { x: moveX, y: moveY } = touchData.current.moveData;

                const endX = evt.changedTouches[0].clientX;
                const endY = evt.changedTouches[0].clientY;
                const cX = endX - startX;
                const cY = endY - startY;
                const translateSiteX = moveX + cX;
                const translateY = moveY + cY;
                const clientWidth = touchData.current.winWidth - touchRef.current.clientWidth;
                const cWidth = clientWidth / 2;
                let translateX = 0;
                if (cWidth <= Math.abs(translateSiteX)) {
                    translateX = position.left ? clientWidth : -clientWidth;
                }
                if (Math.abs(cX) <= 10 && Math.abs(cY) <= 10) {
                    onClick && onClick();
                }
                animation({
                    translateX,
                    translateY,
                    s: 0.1,
                    isEnd: true,
                });
            }
        },
        [onClick, position.left],
    );
    const className = useMemo(
        () =>
            position && Object.keys(position)
                ? `position-${position.top ? 'top' : 'bottom'}-${position.left ? 'left' : 'right'}`
                : '',
        [position],
    );
    return (
        <div
            ref={touchRef}
            className={`${styles['touch-content']}  ${styles[className]}`}
            onTouchStart={touchStartHandle}
            onTouchMove={touchMoveHandle}
            onTouchEnd={touchEndHandle}
            onMouseDown={mouseDown}
        >
            {children}
        </div>
    );
}

MyFloatBlock.propTypes = {
    children: PropTypes.any,
    position: PropTypes.object,
    onClick: PropTypes.func,
};
MyFloatBlock.defaultProps = {
    position: {
        bottom: true,
        right: true,
    },
};

export default  React.forwardRef(MyFloatBlock);
// export default (MyFloatBlock);
