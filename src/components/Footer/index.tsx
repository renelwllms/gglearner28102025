import React from 'react';
import { Layout } from '@arco-design/web-react';
import { FooterProps } from '@arco-design/web-react/es/Layout/interface';
import cs from 'classnames';
import styles from './style/index.module.less';

function Footer(props: FooterProps = {}) {
  const { className, ...restProps } = props;
  return (
    <Layout.Footer className={cs(styles.footer, className)} {...restProps}>
      <div className={styles.footerContent}>
        <span>The Get Group Learners</span>
        <span className={styles.separator}>|</span>
        <span>
          Developed & Hosted by{' '}
          <a
            href="https://edgepoint.co.nz"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.edgepointLink}
          >
            Edgepoint
          </a>
        </span>
      </div>
    </Layout.Footer>
  );
}

export default Footer;
