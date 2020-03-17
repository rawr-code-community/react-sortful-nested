import * as React from "react";
import { storiesOf } from "@storybook/react";
import classnames from "classnames";
import arrayMove from "array-move";

import {
  DragEndMeta,
  DropLineRendererInjectedProps,
  GhostRendererMeta,
  Item,
  List,
  PlaceholderRendererInjectedProps,
  PlaceholderRendererMeta,
} from "../src";

import { commonStyles } from "./shared";
import styles from "./0-vertical-simple.stories.css";

type DummyItem = { id: string; title: string };

const renderDropLineElement = (injectedProps: DropLineRendererInjectedProps) => (
  <div ref={injectedProps.ref} className={commonStyles.dropLine} style={injectedProps.style} />
);

storiesOf("0 Vertical Simple", module)
  .add("Static", () => {
    const renderGhostElement = React.useCallback(
      () => <div className={classnames(styles.item, styles.ghost, styles.static)} />,
      [],
    );
    const renderPlaceholderElement = React.useCallback(
      (injectedProps: PlaceholderRendererInjectedProps) => (
        <div
          {...injectedProps.binder()}
          className={classnames(styles.item, styles.dragging, styles.static)}
          style={injectedProps.style}
        />
      ),
      [],
    );

    return (
      <List
        className={styles.wrapper}
        renderDropLine={renderDropLineElement}
        renderGhost={renderGhostElement}
        renderPlaceholder={renderPlaceholderElement}
        onDragEnd={() => false}
      >
        <Item className={styles.item} identifier="a" index={0}>
          Item A
        </Item>
        <Item className={styles.item} identifier="b" index={1}>
          Item B
        </Item>
        <Item className={styles.item} identifier="c" index={2}>
          Item C
        </Item>
        <Item className={styles.item} identifier="d" index={3}>
          Item D
        </Item>
        <Item className={styles.item} identifier="e" index={4}>
          Item E
        </Item>
      </List>
    );
  })
  .add("Dynamic", () => {
    const [itemsState, setItemsState] = React.useState((): DummyItem[] => [
      { id: "a", title: "Item A" },
      { id: "b", title: "Item B" },
      { id: "c", title: "Item C" },
      { id: "d", title: "Item D" },
      { id: "e", title: "Item E" },
    ]);
    const itemsById = React.useMemo(
      () =>
        itemsState.reduce<Record<DummyItem["id"], DummyItem>>((object, item) => {
          object[item.id] = item;

          return object;
        }, {}),
      [itemsState],
    );

    const itemElements = React.useMemo(
      () =>
        itemsState.map((item, index) => (
          <Item key={item.id} className={styles.item} identifier={item.id} index={index}>
            {item.title}
          </Item>
        )),
      [itemsState],
    );
    const renderGhostElement = React.useCallback(
      ({ identifier }: GhostRendererMeta<DummyItem["id"]>) => {
        const item = itemsById[identifier];

        return <div className={classnames(styles.item, styles.ghost)}>{item.title}</div>;
      },
      [itemsById],
    );
    const renderPlaceholderElement = React.useCallback(
      (injectedProps: PlaceholderRendererInjectedProps, { identifier }: PlaceholderRendererMeta<DummyItem["id"]>) => {
        const item = itemsById[identifier];

        return (
          <div {...injectedProps.binder()} className={classnames(styles.item, styles.dragging)} style={injectedProps.style}>
            {item.title}
          </div>
        );
      },
      [],
    );

    const onDragEnd = React.useCallback(
      (meta: DragEndMeta<DummyItem["id"]>) => {
        if (meta.nextIndex == undefined) return;

        setItemsState(arrayMove(itemsState, meta.index, meta.nextIndex));
      },
      [itemsState],
    );

    return (
      <List
        className={styles.wrapper}
        renderDropLine={renderDropLineElement}
        renderGhost={renderGhostElement}
        renderPlaceholder={renderPlaceholderElement}
        onDragEnd={onDragEnd}
      >
        {itemElements}
      </List>
    );
  });