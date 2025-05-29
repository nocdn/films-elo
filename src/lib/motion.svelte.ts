import { hover, animate, press } from "motion";
import type { Action } from "svelte/action";

export const hoverAndPress: Action = (node) => {
  // the node has been mounted in the DOM

  $effect(() => {
    // hover(node, (element) => {
    //   animate(element, { scale: 1.05 }, { duration: 0.3, type: "spring" });

    //   return () => {
    //     animate(element, { scale: 1 }, { duration: 0.2, type: "spring" });
    //   };
    // });

    press(node, (element) => {
      animate(
        element,
        { scale: 0.95 },
        { type: "spring", stiffness: 1000, duration: 0.1 },
      );

      return () => {
        animate(element, { scale: 1 }, { type: "spring", stiffness: 100 });
      };
    });
  });
};
