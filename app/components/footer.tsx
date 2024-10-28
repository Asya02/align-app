import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    <footer className="flex justify-between items-center p-4 border-t">
      <p className="text-sm">
        Created by <Link href="https://eugeneyan.com" target="_blank" rel="noopener noreferrer" className="font-bold hover:underline">Eugene Yan</Link>.
      </p>
      <div className="flex space-x-4">
        <Link href="https://x.com/eugeneyan" target="_blank" rel="noopener noreferrer">
          <Image src="/x.svg" alt="X" width={20} height={20} className="footer-icon" />
        </Link>
        <Link href="https://github.com/eugeneyan/align-app" target="_blank" rel="noopener noreferrer">
          <Image src="/github.svg" alt="GitHub" width={20} height={20} className="footer-icon" />
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
