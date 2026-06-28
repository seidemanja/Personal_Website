import { useEffect, useLayoutEffect, useState } from 'react';

const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;

const DEFAULT_LAYOUT = {
  connectorStyle: undefined,
  diagramStyle: undefined,
  height: 0,
  lines: [],
  positions: {},
  width: 0,
};

function readStoredLayout(storageKey, fallbackLayout = DEFAULT_LAYOUT) {
  if (typeof window === 'undefined' || !storageKey) {
    return fallbackLayout;
  }

  try {
    const stored = JSON.parse(
      sessionStorage.getItem(`architecture-layout:${storageKey}`) || 'null',
    );

    if (
      stored?.version === 'architecture-layout-v1'
      && Math.abs(stored.viewportWidth - window.innerWidth) <= 8
      && stored.layout
    ) {
      return stored.layout;
    }
  } catch {
    sessionStorage.removeItem(`architecture-layout:${storageKey}`);
  }

  return fallbackLayout;
}

function writeStoredLayout(storageKey, layout) {
  if (typeof window === 'undefined' || !storageKey) {
    return;
  }

  try {
    sessionStorage.setItem(
      `architecture-layout:${storageKey}`,
      JSON.stringify({
        layout,
        version: 'architecture-layout-v1',
        viewportHeight: window.innerHeight,
        viewportWidth: window.innerWidth,
      }),
    );
  } catch {
    // If session storage is unavailable or full, fall back to recalculation.
  }
}

function readBox(ref) {
  if (!ref.current) {
    return null;
  }

  return {
    height: ref.current.offsetHeight,
    width: ref.current.offsetWidth,
  };
}

function readWidth(ref, fallback) {
  if (!ref?.current) {
    return fallback;
  }

  return ref.current.offsetWidth || fallback;
}

export function useArchitectureLayout(refs, options = {}) {
  const {
    bottomGap = 8,
    centerTop = 24,
    childGap = 24,
    containerRef,
    horizontalGap = 72,
    initialLayout = DEFAULT_LAYOUT,
    layout: layoutMode = 'cross',
    storageKey,
    topOffset = 24,
    verticalGap = 44,
    width = 900,
  } = options;
  const [layout, setLayout] = useState(() =>
    readStoredLayout(storageKey, initialLayout),
  );

  useIsomorphicLayoutEffect(() => {
    function updateLayout() {
      const account = readBox(refs.account);
      const browser = readBox(refs.browser);
      const center = readBox(refs.center);
      const bottom = readBox(refs.bottom);
      const top = refs.top ? readBox(refs.top) : null;
      const layoutWidth = readWidth(containerRef, width);

      if (!account || !browser || !center || !bottom || (refs.top && !top)) {
        return;
      }

      if (layoutMode === 'parent-row') {
        const parentTop = centerTop;
        const parentLeft = (layoutWidth - center.width) / 2;
        const parentBottom = parentTop + center.height;
        const childrenTop = parentBottom + verticalGap;
        const childrenWidth =
          account.width + browser.width + bottom.width + childGap * 2;
        const childrenLeft = (layoutWidth - childrenWidth) / 2;

        const nextPositions = {
          account: {
            left: childrenLeft,
            top: childrenTop,
            transform: 'none',
          },
          browser: {
            left: childrenLeft + account.width + childGap,
            top: childrenTop,
            transform: 'none',
          },
          bottom: {
            left:
              childrenLeft +
              account.width +
              browser.width +
              childGap * 2,
            top: childrenTop,
            transform: 'none',
          },
          center: {
            left: parentLeft,
            top: parentTop,
            transform: 'none',
          },
        };

        const parentCenterX = parentLeft + center.width / 2;
        const accountCenterX = nextPositions.account.left + account.width / 2;
        const browserCenterX = nextPositions.browser.left + browser.width / 2;
        const bottomCenterX = nextPositions.bottom.left + bottom.width / 2;
        const crossbarY = parentBottom + verticalGap / 2;
        const nextLines = [
          {
            x1: parentCenterX,
            x2: parentCenterX,
            y1: parentBottom,
            y2: childrenTop,
          },
          {
            x1: accountCenterX,
            x2: bottomCenterX,
            y1: crossbarY,
            y2: crossbarY,
          },
          ...[accountCenterX, bottomCenterX].map((x) => ({
            x1: x,
            x2: x,
            y1: crossbarY,
            y2: childrenTop,
          })),
        ];
        const diagramHeight =
          childrenTop +
          Math.max(account.height, browser.height, bottom.height) +
          bottomGap;

        const nextLayout = {
          connectorStyle: { height: diagramHeight },
          diagramStyle: { minHeight: diagramHeight },
          height: diagramHeight,
          lines: nextLines,
          positions: nextPositions,
          width: layoutWidth,
        };

        setLayout(nextLayout);
        writeStoredLayout(storageKey, nextLayout);
        return;
      }

      const measuredCenterTop = top
        ? topOffset + top.height + verticalGap
        : centerTop;
      const centerLeft = (layoutWidth - center.width) / 2;
      const centerRight = centerLeft + center.width;
      const centerBottom = measuredCenterTop + center.height;
      const horizontalY = measuredCenterTop + center.height / 2;

      const nextPositions = {
        account: {
          left: centerLeft - horizontalGap - account.width,
          top: measuredCenterTop,
          transform: 'none',
        },
        browser: {
          left: centerRight + horizontalGap,
          top: measuredCenterTop,
          transform: 'none',
        },
        bottom: {
          left: (layoutWidth - bottom.width) / 2,
          top: centerBottom + verticalGap,
          transform: 'none',
        },
        center: {
          left: centerLeft,
          top: measuredCenterTop,
          transform: 'none',
        },
      };

      const nextLines = [
        {
          x1: nextPositions.account.left + account.width,
          x2: nextPositions.browser.left,
          y1: horizontalY,
          y2: horizontalY,
        },
        {
          x1: layoutWidth / 2,
          x2: layoutWidth / 2,
          y1: centerBottom,
          y2: nextPositions.bottom.top,
        },
      ];

      if (top) {
        nextPositions.top = {
          left: (layoutWidth - top.width) / 2,
          top: topOffset,
          transform: 'none',
        };
        nextLines.push({
          x1: layoutWidth / 2,
          x2: layoutWidth / 2,
          y1: nextPositions.top.top + top.height,
          y2: measuredCenterTop,
        });
      }

      const boundsLeft = Math.min(
        nextPositions.account.left,
        nextPositions.browser.left,
        nextPositions.center.left,
        nextPositions.bottom.left,
        nextPositions.top?.left ?? layoutWidth,
      );
      const boundsRight = Math.max(
        nextPositions.account.left + account.width,
        nextPositions.browser.left + browser.width,
        nextPositions.center.left + center.width,
        nextPositions.bottom.left + bottom.width,
        nextPositions.top ? nextPositions.top.left + top.width : 0,
      );
      const diagramCenterOffset = layoutWidth / 2 - (boundsLeft + boundsRight) / 2;
      Object.values(nextPositions).forEach((position) => {
        position.left += diagramCenterOffset;
      });
      nextLines.forEach((line) => {
        line.x1 += diagramCenterOffset;
        line.x2 += diagramCenterOffset;
      });

      const diagramHeight = nextPositions.bottom.top + bottom.height + bottomGap;

      const nextLayout = {
        connectorStyle: { height: diagramHeight },
        diagramStyle: { minHeight: diagramHeight },
        height: diagramHeight,
        lines: nextLines,
        positions: nextPositions,
        width: layoutWidth,
      };

      setLayout(nextLayout);
      writeStoredLayout(storageKey, nextLayout);
    }

    updateLayout();

    const observer =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(updateLayout);

    [
      containerRef,
      refs.account,
      refs.browser,
      refs.center,
      refs.bottom,
      refs.top,
    ].forEach((ref) => {
      if (ref?.current) {
        observer?.observe(ref.current);
      }
    });

    window.addEventListener('resize', updateLayout);

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', updateLayout);
    };
  }, [
    bottomGap,
    centerTop,
    childGap,
    containerRef,
    horizontalGap,
    initialLayout,
    layoutMode,
    refs,
    storageKey,
    topOffset,
    verticalGap,
    width,
  ]);

  return layout;
}
