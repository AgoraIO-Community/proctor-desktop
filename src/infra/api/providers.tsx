import { FC, PropsWithChildren, createContext } from 'react';
import { FcrTheme, FcrUIConfig, ThemeProvider } from 'agora-common-libs';
import { I18nProvider } from 'agora-common-libs';

export const uiConfigContext = createContext({} as FcrUIConfig);

const { Provider, Consumer } = uiConfigContext;

export const Providers: FC<
  PropsWithChildren<{ language: string; uiConfig: FcrUIConfig; theme: FcrTheme }>
> = ({ children, language, uiConfig, theme }) => {
  return (
    <I18nProvider language={language}>
      <ThemeProvider value={theme}>
        <Provider value={uiConfig}>{children}</Provider>
      </ThemeProvider>
    </I18nProvider>
  );
};

export const UIConfigConsumer = Consumer;
