import { defineStoryblokBlocks } from "@storyblok/astro";

import Page from "./Page.astro";
import PageHeader from "./PageHeader.astro";
import Hero from "./Hero.astro";
import Button from "./Button.astro";
import TeaserGrid from "./TeaserGrid.astro";
import Teaser from "./Teaser.astro";
import RichText from "./RichText.astro";
import ImageText from "./ImageText.astro";
import Quote from "./Quote.astro";
import PersonGrid from "./PersonGrid.astro";
import Person from "./Person.astro";
import ContactCard from "./ContactCard.astro";
import LinkGroup from "./LinkGroup.astro";
import LinkItem from "./LinkItem.astro";
import EventTable from "./EventTable.astro";
import Fallback from "./Fallback.astro";

export const { StoryblokBlock, StoryblokRichText } = defineStoryblokBlocks(() => ({
  components: {
    page: Page,
    page_header: PageHeader,
    hero: Hero,
    button: Button,
    teaser_grid: TeaserGrid,
    teaser: Teaser,
    rich_text: RichText,
    image_text: ImageText,
    quote: Quote,
    person_grid: PersonGrid,
    person: Person,
    contact_card: ContactCard,
    link_group: LinkGroup,
    link_item: LinkItem,
    event_table: EventTable,
  },
  fallback: Fallback,
}));
